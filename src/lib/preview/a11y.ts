/**
 * Accessibility scoring + helpers for the live preview.
 *
 * The actual axe-core run happens INSIDE the Sandpack iframe (see `buildA11yRunner`),
 * which postMessages the raw results back to the parent. These helpers turn those
 * results into a 0-100 score and the formatted instruction used by the "Fix
 * accessibility" repair pass.
 *
 * NOTE: this is an automated check (axe-core) that catches roughly half of WCAG
 * issues. It is NOT a certification. Treat the score as a directional signal.
 */

export type A11yImpact = 'critical' | 'serious' | 'moderate' | 'minor';

/** A single axe violation, trimmed to the fields the UI + repair prompt need. */
export interface A11yViolation {
  id: string;
  impact: A11yImpact | null;
  help: string;
  helpUrl?: string;
  /** Number of DOM nodes affected by this violation. */
  nodeCount: number;
}

/** The payload posted from the in-iframe axe runner. */
export interface A11yMessage {
  type: 'trace-a11y';
  violations: A11yViolation[];
  passes: number;
}

/** Score penalty per violation, weighted by impact. */
const IMPACT_WEIGHT: Record<A11yImpact, number> = {
  critical: 15,
  serious: 10,
  moderate: 5,
  minor: 2,
};

/**
 * Compute a 0-100 accessibility score. Starts at 100, subtracts the impact weight
 * for every violation (a violation affecting N nodes counts once). Floors at 0.
 */
export function computeA11yScore(violations: A11yViolation[]): number {
  const penalty = violations.reduce((sum, v) => {
    const weight = v.impact ? IMPACT_WEIGHT[v.impact] : IMPACT_WEIGHT.minor;
    return sum + weight;
  }, 0);
  return Math.max(0, 100 - penalty);
}

/** Map a score to a cartographic band used for color-coding the badge. */
export function scoreBand(score: number): 'good' | 'mid' | 'poor' {
  if (score >= 90) return 'good';
  if (score >= 70) return 'mid';
  return 'poor';
}

/**
 * Format violations into a concise, model-friendly instruction for the a11y
 * repair pass. Kept compact to control prompt tokens.
 */
export function formatA11yViolations(violations: A11yViolation[]): string {
  if (violations.length === 0) return 'No accessibility issues detected.';
  const lines = violations.map((v, i) => {
    const impact = v.impact ? `[${v.impact}] ` : '';
    return `${i + 1}) ${impact}${v.id}: ${v.help} (${v.nodeCount} node${v.nodeCount === 1 ? '' : 's'})`;
  });
  return `The component has these accessibility issues:\n${lines.join('\n')}`;
}

/** The result of parsing a Sandpack console `log` array for the a11y marker. */
export type ParsedA11yLog =
  | { kind: 'result'; violations: A11yViolation[]; passes: number }
  | { kind: 'error'; message: string }
  | null;

/**
 * Parse a Sandpack console `log` array (the `log` field of a `type:'console'` message)
 * for the a11y marker line. Returns null if this log isn't an a11y report.
 */
export function parseA11yConsoleLog(log: unknown): ParsedA11yLog {
  if (!Array.isArray(log)) return null;
  const line = log.find((x) => typeof x === 'string' && x.startsWith(A11Y_CONSOLE_MARKER));
  if (typeof line !== 'string') return null;
  try {
    const payload = JSON.parse(line.slice(A11Y_CONSOLE_MARKER.length)) as Record<string, unknown>;
    if (payload.type === 'trace-a11y') {
      return {
        kind: 'result',
        violations: normalizeAxeViolations(payload.violations),
        passes: typeof payload.passes === 'number' ? payload.passes : 0,
      };
    }
    if (payload.type === 'trace-a11y-error') {
      return { kind: 'error', message: String(payload.message ?? 'axe failed') };
    }
  } catch {
    return { kind: 'error', message: 'malformed a11y report' };
  }
  return null;
}

/**
 * Normalize the raw axe `violations` array (from inside the iframe) into our
 * trimmed shape. Defensive against missing/odd fields.
 */
export function normalizeAxeViolations(raw: unknown): A11yViolation[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v): v is Record<string, unknown> => !!v && typeof v === 'object')
    .map((v) => {
      const impact = v.impact;
      const nodes = Array.isArray(v.nodes) ? v.nodes.length : 0;
      return {
        id: typeof v.id === 'string' ? v.id : 'unknown',
        impact:
          impact === 'critical' || impact === 'serious' || impact === 'moderate' || impact === 'minor'
            ? impact
            : null,
        help: typeof v.help === 'string' ? v.help : 'Accessibility issue',
        helpUrl: typeof v.helpUrl === 'string' ? v.helpUrl : undefined,
        nodeCount: nodes,
      };
    });
}

/**
 * Marker prefix on a console.log line carrying the a11y payload. Sandpack relays iframe
 * console output to the parent via its client protocol (the same channel
 * SandpackErrorWatcher uses), so we piggyback on console rather than raw postMessage —
 * a raw postMessage from the sandboxed preview iframe does not reach the Trace window.
 */
export const A11Y_CONSOLE_MARKER = '__TRACE_A11Y__';

/** Fast, reliable CDN build of axe-core injected as a <script> into the preview iframe. */
export const AXE_CDN_URL = 'https://cdn.jsdelivr.net/npm/axe-core@4/axe.min.js';

/**
 * The TS module injected as `/a11y.ts`. It injects axe-core from a fast CDN as a
 * <script> into the preview iframe's own <head> (the same pattern the entry uses for
 * Tailwind), polls until \`window.axe\` exists, runs the audit against the rendered DOM
 * after mount, and reports via console.log. Sandpack relays iframe console to the Trace
 * window; a raw postMessage from the sandboxed preview iframe does not reach it.
 *
 * Robustness: depending on \`customSetup.dependencies\` to bundle axe-core was slow/flaky
 * and the client-side timeout fired before axe was ready. Injecting the prebuilt UMD
 * bundle directly is far faster, and the runner waits for it (polls up to ~10s), retries
 * the run once on failure, and only emits the "unavailable" error signal after retries.
 */
export const A11Y_RUNNER_SOURCE = `// Injected by Trace: runs axe-core inside the preview iframe and reports to the Trace app.
const MARKER = '${A11Y_CONSOLE_MARKER}';
const AXE_CDN_URL = '${AXE_CDN_URL}';

declare global {
  interface Window { axe?: { run: (ctx: unknown, opts: unknown) => Promise<{ violations?: unknown[]; passes?: unknown[] }> } }
}

function report(payload: unknown) {
  try { console.log(MARKER + JSON.stringify(payload)); } catch (e) { /* noop */ }
}

// Inject the axe-core UMD bundle into the iframe <head> once. Resolves whether or not
// the script tag has loaded yet; readiness is determined by polling for window.axe.
function injectAxe(): void {
  if (document.getElementById('trace-axe-cdn')) return;
  const s = document.createElement('script');
  s.id = 'trace-axe-cdn';
  s.src = AXE_CDN_URL;
  document.head.appendChild(s);
}

// Poll every 100ms for up to ~10s for window.axe to be defined.
function waitForAxe(): Promise<boolean> {
  return new Promise((resolve) => {
    const deadline = Date.now() + 10000;
    const tick = () => {
      if (window.axe && typeof window.axe.run === 'function') { resolve(true); return; }
      if (Date.now() >= deadline) { resolve(false); return; }
      setTimeout(tick, 100);
    };
    tick();
  });
}

async function audit(): Promise<void> {
  const results = await window.axe!.run(document.body, {
    resultTypes: ['violations'],
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'best-practice'] },
  });
  const violations = (results.violations || []).map((v: Record<string, unknown>) => ({
    id: v.id, impact: v.impact || null, help: v.help, helpUrl: v.helpUrl, nodes: v.nodes,
  }));
  report({ type: 'trace-a11y', violations, passes: (results.passes || []).length });
}

async function runTraceA11y() {
  injectAxe();
  const ready = await waitForAxe();
  if (!ready) {
    report({ type: 'trace-a11y-error', message: 'axe-core failed to load' });
    return;
  }
  try {
    await audit();
  } catch (err) {
    // Retry the run once before giving up — axe can transiently throw if the DOM
    // mutated mid-run.
    try {
      await audit();
    } catch (err2) {
      report({ type: 'trace-a11y-error', message: String(err2 || err) });
    }
  }
}

// Give React time to mount + paint before auditing.
function schedule() { setTimeout(runTraceA11y, 600); }
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  schedule();
} else {
  window.addEventListener('DOMContentLoaded', schedule);
}

export {};
`;

/**
 * Custom Sandpack entry (`/index.tsx`) that renders the generated App AND imports the
 * a11y runner as a side effect, so the audit executes inside the preview iframe. The
 * react-ts template's entry is `/index.tsx`, so overriding it here is what runs the runner.
 */
export const A11Y_ENTRY_SOURCE = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './a11y';

// Tailwind: the Play CDN is a <script>, not a stylesheet. Sandpack's
// \`externalResources\` injects bare URLs as <link> tags (so Tailwind never
// initialized and utility classes did nothing) and a custom /public/index.html
// is ignored by the runtime bundler. The reliable path is to inject the Play CDN
// <script> into the preview iframe's own <head> from the entry, which runs inside
// the iframe. We seed \`tailwind.config\` with the cartographic theme tokens the
// catalog components use, then render once Tailwind has finished its first pass.
function loadTailwind(): Promise<void> {
  if (document.getElementById('trace-tailwind-cdn')) return Promise.resolve();
  (window as unknown as { tailwind?: { config?: unknown } }).tailwind = {
    config: {
      theme: {
        extend: {
          colors: {
            parchment: '#F9F6F0',
            'warm-white': '#FFFAF3',
            ink: '#2C3E50',
            'deep-charcoal': '#1A1D23',
            muted: '#7A8B8C',
            compass: { DEFAULT: '#C84B31', dark: '#A63D2A', light: '#D85740' },
            ocean: { DEFAULT: '#1A535C', dark: '#14424A', light: '#E8F4F5' },
            terrain: { DEFAULT: '#4E6E58', dark: '#3D5246', light: '#EDF3EF' },
            gold: { DEFAULT: '#D4AF37', muted: '#F9E5C7', light: '#FDF8E8' },
          },
        },
      },
    },
  };
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.id = 'trace-tailwind-cdn';
    s.src = 'https://cdn.tailwindcss.com';
    // Resolve on load or error so a CDN hiccup never blocks the render.
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

function mount() {
  const el = document.getElementById('root');
  if (el) {
    createRoot(el).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
}

void loadTailwind().then(mount);
`;
