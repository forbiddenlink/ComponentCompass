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
 * The TS source injected as `/a11y.ts` into the Sandpack files. It dynamically
 * imports axe-core, runs it against the rendered DOM after mount, and posts the
 * trimmed results to the parent window. Self-contained: no app imports.
 */
/**
 * Marker prefix on a console.log line carrying the a11y payload. Sandpack relays iframe
 * console output to the parent via its client protocol (the same channel
 * SandpackErrorWatcher uses), so we piggyback on console rather than raw postMessage —
 * a raw postMessage from the sandboxed preview iframe does not reach the Trace window.
 */
export const A11Y_CONSOLE_MARKER = '__TRACE_A11Y__';

/**
 * The TS module injected as `/a11y.ts`. Statically imports axe-core (bundled via
 * customSetup.dependencies), audits the rendered DOM after mount, and reports via
 * console.log (Sandpack relays iframe console to the Trace window; a raw postMessage
 * from the sandboxed preview iframe does not reach it).
 */
export const A11Y_RUNNER_SOURCE = `// Injected by Trace: runs axe-core inside the preview iframe and reports to the Trace app.
import axe from 'axe-core';

const MARKER = '${A11Y_CONSOLE_MARKER}';

function report(payload: unknown) {
  try { console.log(MARKER + JSON.stringify(payload)); } catch (e) { /* noop */ }
}

async function runTraceA11y() {
  try {
    const results = await axe.run(document.body, {
      resultTypes: ['violations'],
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'best-practice'] },
    });
    const violations = (results.violations || []).map((v) => ({
      id: v.id, impact: v.impact || null, help: v.help, helpUrl: v.helpUrl, nodes: v.nodes,
    }));
    report({ type: 'trace-a11y', violations, passes: (results.passes || []).length });
  } catch (err) {
    report({ type: 'trace-a11y-error', message: String(err) });
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

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
`;
