import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
  UnstyledOpenInCodeSandboxButton,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { cn } from '../lib/utils';
import { imageToBase64 } from '../services/vision';
import { GALLERY_EXAMPLES } from '../data/gallery';
import {
  A11Y_ENTRY_SOURCE,
  A11Y_RUNNER_SOURCE,
  computeA11yScore,
  formatA11yViolations,
  parseA11yConsoleLog,
  scoreBand,
  type A11yViolation,
} from '../lib/preview/a11y';

interface Detection {
  label: string;
  componentName: string;
  variant?: string;
  confidence: number;
}

interface GenResult {
  detections: Detection[];
  jsx: string;
  componentsUsed: string[];
  notes: string;
  repairs?: number;
}

type Status = 'idle' | 'loading' | 'ready' | 'error';

/** A tiny inline placeholder so the empty state's "try a sample" is self-contained. */
const SAMPLE_DATA_URL =
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400">
      <rect width="640" height="400" fill="#F4F1EA"/>
      <rect x="40" y="40" width="560" height="120" rx="4" fill="#FBFAF5" stroke="#1F2933" stroke-opacity="0.12"/>
      <text x="64" y="84" font-family="sans-serif" font-size="22" fill="#1F2933">Welcome back</text>
      <text x="64" y="116" font-family="sans-serif" font-size="14" fill="#1F2933" opacity="0.7">Sign in to continue</text>
      <rect x="40" y="190" width="560" height="44" rx="3" fill="#fff" stroke="#1F2933" stroke-opacity="0.22"/>
      <text x="56" y="218" font-family="sans-serif" font-size="13" fill="#1F2933" opacity="0.55">Email</text>
      <rect x="40" y="250" width="560" height="44" rx="3" fill="#fff" stroke="#1F2933" stroke-opacity="0.22"/>
      <text x="56" y="278" font-family="sans-serif" font-size="13" fill="#1F2933" opacity="0.55">Password</text>
      <rect x="40" y="320" width="180" height="44" rx="3" fill="#C5482E"/>
      <text x="92" y="348" font-family="sans-serif" font-size="14" fill="#fff">Sign in</text>
      <rect x="236" y="320" width="140" height="44" rx="3" fill="#fff" stroke="#C5482E"/>
      <text x="272" y="348" font-family="sans-serif" font-size="14" fill="#C5482E">Cancel</text>
    </svg>`,
  );

/**
 * Map an HTTP status (and optional safe backend hint) to friendly, user-facing copy.
 * Never returns raw provider/internal error text in the empty state path.
 */
function friendlyError(status: number, backendMessage: string): string {
  // The only backend strings safe to show verbatim are our own input-validation
  // messages (data URL / image too large / unsupported type). Everything else is
  // mapped to a generic friendly line so provider internals never reach the UI.
  const safe = /data url|too large|image type|unsupported|temporarily unavailable/i.test(
    backendMessage,
  );
  if (safe && backendMessage) return backendMessage;
  if (status === 413) return 'That image is too large. Please try one under 4 MB.';
  if (status === 503) return 'Trace is temporarily unavailable. Please try again in a moment.';
  if (status === 429) return 'Too many requests right now. Please wait a moment and try again.';
  return 'Something went wrong while tracing this screenshot. Please try again.';
}

/** Fetch an image URL (e.g. a gallery example PNG) and convert it to a base64 data URL. */
async function fetchImageAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load example image (${res.status})`);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Confidence as a fine measured tick-scale (a surveyor's gauge), not a full-width
 * progress bar. 20 hairline ticks; the filled ticks read like a precision dial.
 * The numeric value stays in mono (raw data per the type rules).
 */
function ConfidenceBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(1, value));
  const pct = Math.round(clamped * 100);
  const TICKS = 20;
  const filled = Math.round(clamped * TICKS);
  return (
    <div className="flex items-center gap-2.5" aria-label={`Confidence ${pct} percent`}>
      <div className="flex flex-1 items-end gap-px h-3.5" aria-hidden="true">
        {Array.from({ length: TICKS }).map((_, i) => {
          const on = i < filled;
          // Every 5th tick is a taller major gradation.
          const major = i % 5 === 0;
          return (
            <span
              key={i}
              className={cn(
                'flex-1 rounded-[0.5px] transition-colors',
                on ? 'bg-compass' : 'bg-line-soft',
                major ? 'h-full' : 'h-2',
              )}
            />
          );
        })}
      </div>
      <span className="text-[11px] font-mono tabular-nums text-graphite w-9 text-right">{pct}%</span>
    </div>
  );
}

/**
 * Invisible child of SandpackProvider that listens for Sandpack compile/runtime errors
 * and surfaces an "Ask Trace to fix it" affordance that triggers a targeted repair.
 */
function SandpackErrorWatcher({
  onFix,
  isFixing,
}: {
  onFix: (errorMessage: string) => void;
  isFixing: boolean;
}) {
  const { listen } = useSandpack();
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = listen((msg) => {
      // Sandpack emits action:'show-error' (compile/transform) and
      // type:'action' with action:'show-error', plus 'console' error events.
      if (msg.type === 'action' && msg.action === 'show-error') {
        const message = [msg.title, msg.message].filter(Boolean).join(': ');
        setRuntimeError(message || 'The generated code threw a runtime error.');
      } else if (msg.type === 'success' || msg.type === 'start') {
        // A successful (re)compile clears the prior error banner.
        setRuntimeError(null);
      }
    });
    return unsubscribe;
  }, [listen]);

  if (!runtimeError) return null;

  return (
    <div
      className="flex flex-col gap-2 border-t-hair border-compass/40 bg-compass/[0.06] px-4 py-3"
      role="alert"
    >
      <span className="annotate text-compass">preview error</span>
      <p className="text-xs font-mono text-graphite line-clamp-3 whitespace-pre-wrap">{runtimeError}</p>
      <button
        type="button"
        disabled={isFixing}
        onClick={() => onFix(runtimeError)}
        className="self-start px-3 py-1.5 rounded bg-compass text-white text-xs font-display font-semibold hover:bg-compass-dark focus:outline-none focus:ring-2 focus:ring-compass/40 disabled:opacity-60"
      >
        {isFixing ? 'Tracing the fix…' : 'Ask Trace to fix it'}
      </button>
    </div>
  );
}

/** Accessibility check state: what the in-iframe axe runner reported (or didn't). */
type A11yState =
  | { phase: 'pending' }
  | { phase: 'unavailable' }
  | { phase: 'ready'; score: number; violations: A11yViolation[] };

/**
 * Accessibility score badge + collapsible violations list + "Fix accessibility" action.
 * Listens for `trace-a11y` postMessages from the Sandpack iframe (keyed to the current
 * jsx so a re-render re-runs the check and the score visibly re-computes).
 */
function A11yScore({
  jsx,
  onFix,
  isFixing,
}: {
  jsx: string;
  onFix: (violations: A11yViolation[]) => void;
  isFixing: boolean;
}) {
  const { listen } = useSandpack();
  const [state, setState] = useState<A11yState>({ phase: 'pending' });
  const [expanded, setExpanded] = useState(false);

  // New jsx → reset and start waiting for a fresh result.
  useEffect(() => {
    setState({ phase: 'pending' });
    setExpanded(false);
  }, [jsx]);

  useEffect(() => {
    let settled = false;

    // The in-iframe runner reports via console.log; Sandpack relays iframe console
    // to the parent through its client protocol (a raw postMessage from the sandboxed
    // preview iframe does not reach this window).
    const unsubscribe = listen((msg) => {
      if (msg.type !== 'console' || !('log' in msg)) return;
      const logs = (msg as { log?: Array<{ data?: unknown[] }> }).log;
      if (!Array.isArray(logs)) return;
      for (const entry of logs) {
        const parsed = parseA11yConsoleLog(entry?.data);
        if (!parsed) continue;
        settled = true;
        if (parsed.kind === 'result') {
          setState({
            phase: 'ready',
            score: computeA11yScore(parsed.violations),
            violations: parsed.violations,
          });
        } else {
          setState({ phase: 'unavailable' });
        }
      }
    });

    // If nothing arrives, axe failed to load/run — don't hang. The in-iframe runner
    // injects axe from a CDN and polls up to ~10s for it, plus the post-mount delay and
    // a one-shot retry, so give it 15s before declaring the check unavailable. Keyed to
    // `jsx`, so this timer resets on every new generation.
    const timeout = window.setTimeout(() => {
      if (!settled) setState({ phase: 'unavailable' });
    }, 15000);

    return () => {
      unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [listen, jsx]);

  if (state.phase === 'pending') {
    return (
      <div className="flex items-center gap-2.5 border-t-hair border-line-default bg-warm-white px-4 py-3 text-small text-muted">
        <div className="w-3.5 h-3.5 border-2 border-ocean border-t-transparent rounded-full animate-spin" />
        Running accessibility check
      </div>
    );
  }

  if (state.phase === 'unavailable') {
    return (
      <div className="border-t-hair border-line-default bg-warm-white px-4 py-3 text-small text-muted" role="status">
        Accessibility check unavailable.
      </div>
    );
  }

  const { score, violations } = state;
  const band = scoreBand(score);
  const scoreColor =
    band === 'good' ? 'text-terrain' : band === 'mid' ? 'text-gold' : 'text-compass';
  const ruleColor =
    band === 'good' ? 'bg-terrain' : band === 'mid' ? 'bg-gold' : 'bg-compass';

  return (
    <div className="border-t-hair border-line-default bg-warm-white px-4 py-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3.5">
          {/* Measured numeric readout: big graphite figure on a colored gradation rule. */}
          <div
            className="relative flex items-baseline gap-0.5 pl-3"
            aria-label={`Accessibility score ${score} out of 100`}
          >
            <span className={cn('absolute left-0 top-0 bottom-0 w-0.5 rounded-full', ruleColor)} />
            <span className={cn('font-display text-2xl font-bold leading-none tabular-nums', scoreColor)}>
              {score}
            </span>
            <span className="font-mono text-[11px] text-muted">/100</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="annotate">accessibility</span>
            <span
              className="text-[11px] text-muted"
              title="Automated check via axe-core. Catches roughly half of WCAG issues, not a certification."
            >
              axe-core automated check{' '}
              <abbr title="axe-core catches ~57% of WCAG issues automatically. This is a directional signal, not a WCAG certification.">
                ⓘ
              </abbr>
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={violations.length === 0 || isFixing}
          onClick={() => onFix(violations)}
          className="px-3 py-1.5 rounded border-hair border-ocean/50 bg-ocean text-white text-xs font-display font-semibold hover:bg-ocean-dark focus:outline-none focus:ring-2 focus:ring-ocean/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFixing ? 'Fixing…' : 'Fix accessibility'}
        </button>
      </div>

      {violations.length > 0 ? (
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-muted hover:text-ink underline underline-offset-2"
            aria-expanded={expanded}
          >
            {expanded ? 'Hide' : 'Show'} {violations.length} violation
            {violations.length === 1 ? '' : 's'}
          </button>
          {expanded && (
            <ul className="mt-2 flex flex-col">
              {violations.map((v, i) => (
                <li
                  key={`${v.id}-${i}`}
                  className="border-t-hair border-line-soft py-2.5 first:border-t-0"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-mono text-ink">{v.id}</span>
                    {v.impact && (
                      <span
                        className={cn(
                          'annotate px-1.5 py-0.5 rounded-sm',
                          v.impact === 'critical' || v.impact === 'serious'
                            ? 'bg-compass/12 text-compass'
                            : 'bg-gold/15 text-gold',
                        )}
                      >
                        {v.impact}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-graphite mt-1">{v.help}</p>
                  <p className="text-[11px] text-muted mt-0.5 font-mono tabular-nums">
                    {v.nodeCount} node{v.nodeCount === 1 ? '' : 's'} affected
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="mt-2 text-xs text-terrain">No automated accessibility violations found.</p>
      )}
    </div>
  );
}

/** Persisted Sandpack/editor theme choice. */
const THEME_STORAGE_KEY = 'trace-studio-theme';

function useStudioTheme(): [boolean, () => void] {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
  });
  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
      } catch {
        // localStorage may be unavailable (private mode); fail silently.
      }
      return next;
    });
  }, []);
  return [dark, toggle];
}

/** Copy the generated code to the clipboard with a transient confirmation. */
function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [code]);
  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      className="px-3 py-1.5 rounded border-hair border-line-strong text-ink text-xs font-display font-semibold hover:bg-ink/5 focus:outline-none focus:ring-2 focus:ring-compass/40"
      aria-live="polite"
    >
      {copied ? 'Copied!' : 'Copy code'}
    </button>
  );
}

/**
 * Screenshot-vs-render proof. The input screenshot on one side, the live Sandpack
 * preview on the other, behind a draggable divider. The preview is the actual
 * rendered component (not a static snapshot), so the comparison stays live.
 */
function CompareView({ imageUrl, preview }: { imageUrl: string; preview: React.ReactNode }) {
  return (
    <ReactCompareSlider
      className="h-[480px] w-full bg-warm-white"
      itemOne={
        <ReactCompareSliderImage
          src={imageUrl}
          alt="Original screenshot"
          style={{ objectFit: 'contain', background: '#F4F1EA' }}
        />
      }
      itemTwo={<div className="h-full w-full bg-white">{preview}</div>}
    />
  );
}

export function ScreenshotStudio() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<GenResult | null>(null);
  const [code, setCode] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [rightView, setRightView] = useState<'code' | 'compare'>('code');
  const [dark, toggleDark] = useStudioTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generate = useCallback(
    async (
      dataUrl: string,
      repair?: { previousJsx: string; errorMessage: string; repairReason?: 'compile' | 'a11y' },
    ) => {
      // A repair runs on top of an existing result: keep the prior result/code on
      // screen (non-destructive) so a transient failure never wipes the user's work.
      const isRepair = Boolean(repair);
      setStatus('loading');
      setError(null);
      if (!isRepair) {
        setResult(null);
        setImageUrl(dataUrl);
      }
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageDataUrl: dataUrl, ...repair }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: '' }));
          // Never surface raw backend strings; map to friendly copy by status.
          throw new Error(friendlyError(res.status, typeof body?.error === 'string' ? body.error : ''));
        }
        const data: GenResult = await res.json();
        setResult(data);
        setCode(data.jsx);
        setStatus('ready');
      } catch (err) {
        // Friendly copy only. If a result already exists, keep it visible and show a
        // dismissible banner instead of dumping the user back to the empty dropzone.
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Something went wrong while tracing this screenshot. Please try again.';
        setError(message);
        setStatus('error');
      }
    },
    [],
  );

  /**
   * Load a pre-baked gallery example straight into the result view — no upload,
   * no network, no API key. The cached result was produced once by the real
   * pipeline at author time (see scripts/build-gallery.mjs).
   */
  const loadExample = useCallback((example: (typeof GALLERY_EXAMPLES)[number]) => {
    setError(null);
    // Show the thumbnail immediately for a snappy load.
    setImageUrl(example.thumbnail);
    setResult({
      detections: example.result.detections,
      jsx: example.result.jsx,
      componentsUsed: example.result.componentsUsed,
      notes: example.result.notes,
      repairs: example.result.repairs,
    });
    setCode(example.result.jsx);
    setRightView('code');
    setStatus('ready');
    // Convert the example PNG to a base64 data URL so "Fix accessibility" and runtime
    // auto-fix can POST it to /api/generate (which rejects non-`data:` URLs). The cached
    // result is still shown instantly above; this just upgrades imageUrl in the background.
    void fetchImageAsDataUrl(example.thumbnail)
      .then((dataUrl) => setImageUrl(dataUrl))
      .catch(() => {
        // Leave the thumbnail path in place; repair will surface a friendly error if used.
      });
  }, []);

  /** Runtime repair: re-POST the current image + broken jsx + the Sandpack error. */
  const handleAutoFix = useCallback(
    async (errorMessage: string) => {
      if (!imageUrl || !code) return;
      setIsFixing(true);
      try {
        await generate(imageUrl, { previousJsx: code, errorMessage });
      } finally {
        setIsFixing(false);
      }
    },
    [imageUrl, code, generate],
  );

  /** Accessibility repair: re-ask the model to fix the reported a11y violations. */
  const handleFixA11y = useCallback(
    async (violations: A11yViolation[]) => {
      if (!imageUrl || !code || violations.length === 0) return;
      setIsFixing(true);
      try {
        await generate(imageUrl, {
          previousJsx: code,
          errorMessage: formatA11yViolations(violations),
          repairReason: 'a11y',
        });
      } finally {
        setIsFixing(false);
      }
    },
    [imageUrl, code, generate],
  );

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Please provide an image file.');
        setStatus('error');
        return;
      }
      const dataUrl = await imageToBase64(file);
      await generate(dataUrl);
    },
    [generate],
  );

  // Paste-from-clipboard support.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            void handleFile(file);
            e.preventDefault();
          }
          break;
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [handleFile]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const reset = () => {
    setStatus('idle');
    setError(null);
    setImageUrl(null);
    setResult(null);
    setCode('');
  };

  // Keep the workspace mounted whenever there is work to preserve: while loading,
  // when ready, or when an error occurred but we still have a generated result on
  // screen. Only an error with NO prior result falls back to the empty dropzone.
  const hasResult = result !== null && code !== '';
  const showWorkspace = status === 'loading' || status === 'ready' || (status === 'error' && hasResult);

  return (
    <div className="h-full overflow-y-auto draft-grid bg-parchment">
      <div className="max-w-[88rem] mx-auto px-5 py-6 md:px-8 md:py-8">
        <header className="mb-7 flex items-end justify-between gap-4 border-b-hair border-line-strong pb-5">
          <div className="max-w-2xl">
            <span className="annotate text-ocean">studio</span>
            <h1 className="font-display text-h1 text-ink mt-1.5">Trace a screenshot</h1>
            <p className="text-small text-graphite mt-2 leading-relaxed">
              Paste, drop, or upload a UI screenshot. Trace recreates it as a live, editable React
              component grounded in the design-system catalog.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleDark}
            aria-pressed={dark}
            title="Toggle editor theme"
            className="flex-shrink-0 px-3 py-1.5 rounded border-hair border-line-strong text-ink text-xs font-display font-semibold hover:bg-ink/5 focus:outline-none focus:ring-2 focus:ring-compass/40"
          >
            {dark ? '☀ Light editor' : '☾ Dark editor'}
          </button>
        </header>

        {!showWorkspace && (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            {/* Dropzone: a drafting plate with reticle corners + construction grid. */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={cn(
                'reticle draft-grid-strong border-hair p-10 md:p-14 text-center transition-colors',
                isDragging ? 'border-compass bg-compass/[0.04]' : 'border-line-strong',
              )}
            >
              <span className="annotate text-ocean">source · input</span>
              <p className="font-display text-xl font-semibold text-ink mt-3">
                {isDragging ? 'Release to trace it' : 'Drop a screenshot here'}
              </p>
              <p className="text-small text-muted mt-1.5">
                Drag in a PNG, paste from your clipboard with Cmd or Ctrl plus V, or pick a file.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded bg-compass text-white text-sm font-display font-semibold hover:bg-compass-dark focus:outline-none focus:ring-2 focus:ring-compass/40"
                >
                  Choose file
                </button>
                <button
                  type="button"
                  onClick={() => void generate(SAMPLE_DATA_URL)}
                  className="px-4 py-2 rounded border-hair border-line-strong text-ink text-sm font-display font-semibold hover:bg-ink/5 focus:outline-none focus:ring-2 focus:ring-compass/40"
                >
                  Try a live sample
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
              {status === 'error' && error && (
                <p className="mt-4 text-sm text-compass" role="alert">
                  {error}
                </p>
              )}
            </div>

            {/* How it reads, in the drafting voice + the gallery row. */}
            <div className="flex flex-col gap-6">
              <ol className="flex flex-col border-hair border-line-default bg-warm-white">
                {[
                  ['01', 'Capture', 'Hand Trace any interface screenshot.'],
                  ['02', 'Detect', 'It maps each element to a catalog component, with a confidence reading.'],
                  ['03', 'Render', 'A real, editable React component renders live, scored for accessibility.'],
                ].map(([n, title, desc]) => (
                  <li key={n} className="flex gap-3.5 px-4 py-3.5 border-t-hair border-line-soft first:border-t-0">
                    <span className="font-mono text-xs text-ocean tabular-nums pt-0.5">{n}</span>
                    <div>
                      <p className="font-display text-sm font-semibold text-ink">{title}</p>
                      <p className="text-small text-graphite mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {GALLERY_EXAMPLES.length > 0 && (
                <div className="border-hair border-line-default bg-warm-white p-4 text-left">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="annotate text-ocean">gallery</span>
                    <span className="text-[11px] text-muted">pre-traced · no upload or key</span>
                  </div>
                  <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-2">
                    {GALLERY_EXAMPLES.map((example) => (
                      <li key={example.id}>
                        <button
                          type="button"
                          onClick={() => loadExample(example)}
                          className="group flex w-full flex-col gap-2 rounded-sm border-hair border-line-default bg-parchment p-2 text-left transition-colors hover:border-compass focus:outline-none focus:ring-2 focus:ring-compass/40"
                        >
                          <img
                            src={example.thumbnail}
                            alt={`${example.title} example`}
                            loading="lazy"
                            className="h-24 w-full rounded-sm border-hair border-line-soft bg-white object-cover object-top"
                          />
                          <span className="text-xs font-display font-semibold text-ink group-hover:text-compass">
                            {example.title}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {showWorkspace && status === 'error' && error && (
          <div
            className="mb-5 flex items-start justify-between gap-3 border-hair border-compass/40 border-l-2 border-l-compass bg-compass/[0.05] px-4 py-3"
            role="alert"
          >
            <div>
              <span className="annotate text-compass">trace failed</span>
              <p className="text-sm text-graphite mt-1">{error}</p>
              <p className="text-xs text-muted mt-1">Your generated component is still here. Try again when ready.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStatus('ready');
              }}
              className="flex-shrink-0 text-xs text-muted hover:text-ink underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-compass/40 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {showWorkspace && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-[18rem_minmax(0,1fr)_20rem]">
            {/* ZONE 1 · SOURCE — the input screenshot in a construction-grid frame. */}
            <aside className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="annotate text-ocean">source</span>
                <button
                  type="button"
                  onClick={reset}
                  className="annotate text-muted hover:text-ink"
                >
                  + new
                </button>
              </div>
              <div className="reticle draft-grid-strong border-hair border-line-strong p-3">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Uploaded screenshot"
                    className="w-full object-contain bg-white border-hair border-line-soft"
                  />
                ) : (
                  <div className="h-32 grid place-items-center text-small text-muted">
                    No source loaded
                  </div>
                )}
              </div>
              {status === 'loading' && (
                <div className="mt-3 flex items-center gap-2.5 text-graphite text-small">
                  <div className="w-4 h-4 border-2 border-compass border-t-transparent rounded-full animate-spin" />
                  Detecting components
                </div>
              )}
            </aside>

            {/* ZONE 2 · PREVIEW — the live render, the hero (lg: spans both cols). */}
            <section className="order-first lg:order-none lg:col-span-2 xl:col-span-1 flex flex-col">
              <span className="annotate text-ocean mb-2 inline-block">preview · live render</span>
              <div className="reticle border-hair border-line-strong overflow-hidden min-h-[480px] bg-warm-white">
              {status === 'loading' && !code && (
                <div className="flex items-center justify-center h-[480px]">
                  <div className="w-8 h-8 border-2 border-compass border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {code && (
                <SandpackProvider
                  template="react-ts"
                  theme={dark ? 'dark' : 'light'}
                  files={{
                    '/App.tsx': { code },
                    // The a11y runner as a real preview file. Imported from the entry below
                    // (a side-effect import) so it executes inside the rendered iframe.
                    '/a11y.ts': { code: A11Y_RUNNER_SOURCE, hidden: true },
                    // Custom entry: renders App AND imports the runner. Overriding /index.tsx
                    // is what makes the runner execute (Sandpack's react-ts entry is /index.tsx).
                    // Custom entry also injects the Tailwind Play CDN <script> into the
                    // iframe <head> at runtime (see A11Y_ENTRY_SOURCE). The Play CDN is a
                    // <script>, not a stylesheet, so `externalResources` (which injects bare
                    // URLs as <link> tags) left utility classes inert — hence no Tailwind here.
                    '/index.tsx': { code: A11Y_ENTRY_SOURCE, hidden: true },
                  }}
                  customSetup={{ dependencies: { 'lucide-react': 'latest' } }}
                >
                  {/* Toolbar: view toggle + export actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b-hair border-line-default bg-warm-white px-4 py-2">
                    <div
                      className="inline-flex rounded-sm border-hair border-line-default p-0.5"
                      role="group"
                      aria-label="Preview view"
                    >
                      {(['code', 'compare'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setRightView(mode)}
                          aria-pressed={rightView === mode}
                          className={cn(
                            'px-3 py-1 rounded-[2px] text-xs font-display font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-compass/40',
                            rightView === mode
                              ? 'bg-compass text-white'
                              : 'text-graphite hover:bg-ink/5',
                          )}
                        >
                          {mode === 'code' ? 'Code + Preview' : 'Compare'}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <CopyCodeButton code={code} />
                      <UnstyledOpenInCodeSandboxButton className="px-3 py-1.5 rounded border-hair border-line-strong text-ink text-xs font-display font-semibold hover:bg-ink/5 focus:outline-none focus:ring-2 focus:ring-compass/40">
                        Open in CodeSandbox
                      </UnstyledOpenInCodeSandboxButton>
                    </div>
                  </div>

                  {rightView === 'compare' && imageUrl ? (
                    <>
                      <CompareView
                        imageUrl={imageUrl}
                        preview={<SandpackPreview showSandpackErrorOverlay style={{ height: 480 }} />}
                      />
                      <p className="border-t-hair border-line-default bg-warm-white px-4 py-2 text-center text-xs text-muted">
                        Drag the divider. Original screenshot on the left, live render on the right.
                      </p>
                    </>
                  ) : (
                    <SandpackLayout>
                      <SandpackPreview showSandpackErrorOverlay style={{ height: 480 }} />
                      <SandpackCodeEditor showLineNumbers style={{ height: 480 }} />
                    </SandpackLayout>
                  )}
                  <A11yScore jsx={code} onFix={handleFixA11y} isFixing={isFixing} />
                  <SandpackErrorWatcher onFix={handleAutoFix} isFixing={isFixing} />
                </SandpackProvider>
              )}
              </div>
            </section>

            {/* ZONE 3 · INSPECTOR — what the AI sees: detections, catalog, notes. */}
            <aside className="flex flex-col">
              <span className="annotate text-ocean mb-2 inline-block">inspector · what the ai sees</span>
              <div className="border-hair border-line-strong bg-warm-white">
                {status === 'loading' && !result && (
                  <div className="flex items-center gap-2.5 px-4 py-4 text-graphite text-small">
                    <div className="w-4 h-4 border-2 border-compass border-t-transparent rounded-full animate-spin" />
                    Reading the screenshot
                  </div>
                )}

                {result && (
                  <>
                    <ul className="flex flex-col">
                      {result.detections.map((d, i) => (
                        <li
                          key={`${d.label}-${i}`}
                          className="px-4 py-3 border-t-hair border-line-soft first:border-t-0"
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-sm text-ink font-medium">{d.label}</span>
                            <span className="text-[11px] font-mono text-compass text-right">
                              {d.componentName}
                              {d.variant ? ` · ${d.variant}` : ''}
                            </span>
                          </div>
                          <div className="mt-2">
                            <ConfidenceBar value={d.confidence} />
                          </div>
                        </li>
                      ))}
                      {result.detections.length === 0 && (
                        <li className="px-4 py-3 text-small text-muted">No components detected.</li>
                      )}
                    </ul>

                    {result.componentsUsed.length > 0 && (
                      <div className="px-4 py-3 border-t-hair border-line-default">
                        <p className="annotate mb-2">catalog</p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.componentsUsed.map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded-sm border-hair border-ocean/30 bg-ocean/[0.06] text-ocean text-[11px] font-mono"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(result.repairs || result.notes) && (
                      <div className="px-4 py-3 border-t-hair border-line-default flex flex-col gap-1.5">
                        {result.repairs ? (
                          <p className="text-[11px] text-muted font-mono tabular-nums">
                            auto-repaired {result.repairs} time{result.repairs === 1 ? '' : 's'} before compiling
                          </p>
                        ) : null}
                        {result.notes && (
                          <p className="text-xs text-graphite leading-relaxed">{result.notes}</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
