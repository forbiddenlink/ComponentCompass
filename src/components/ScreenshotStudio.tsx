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
      <rect width="640" height="400" fill="#F9F6F0"/>
      <rect x="40" y="40" width="560" height="120" rx="12" fill="#FFFAF3" stroke="#2C3E50" stroke-opacity="0.1"/>
      <text x="64" y="84" font-family="serif" font-size="22" fill="#2C3E50">Welcome back</text>
      <text x="64" y="116" font-family="sans-serif" font-size="14" fill="#2C3E50" opacity="0.7">Sign in to continue</text>
      <rect x="40" y="190" width="560" height="44" rx="8" fill="#fff" stroke="#2C3E50" stroke-opacity="0.2"/>
      <text x="56" y="218" font-family="sans-serif" font-size="13" fill="#2C3E50" opacity="0.5">Email</text>
      <rect x="40" y="250" width="560" height="44" rx="8" fill="#fff" stroke="#2C3E50" stroke-opacity="0.2"/>
      <text x="56" y="278" font-family="sans-serif" font-size="13" fill="#2C3E50" opacity="0.5">Password</text>
      <rect x="40" y="320" width="180" height="44" rx="8" fill="#C45B3C"/>
      <text x="92" y="348" font-family="sans-serif" font-size="14" fill="#fff">Sign in</text>
      <rect x="236" y="320" width="140" height="44" rx="8" fill="#fff" stroke="#C45B3C"/>
      <text x="272" y="348" font-family="sans-serif" font-size="14" fill="#C45B3C">Cancel</text>
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

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="flex items-center gap-2" aria-label={`Confidence ${pct}%`}>
      <div className="h-1.5 flex-1 rounded-full bg-ink/10 overflow-hidden">
        <div className="h-full rounded-full bg-compass transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-ink/60 w-9 text-right">{pct}%</span>
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
      className="flex flex-col gap-2 border-t border-compass/30 bg-compass/5 px-4 py-3"
      role="alert"
    >
      <p className="text-sm font-medium text-compass">Preview error</p>
      <p className="text-xs font-mono text-ink/70 line-clamp-3 whitespace-pre-wrap">{runtimeError}</p>
      <button
        type="button"
        disabled={isFixing}
        onClick={() => onFix(runtimeError)}
        className="self-start px-3 py-1.5 rounded-lg bg-compass text-white text-xs font-display font-semibold shadow-sm hover:bg-compass/90 focus:outline-none focus:ring-2 focus:ring-compass/40 disabled:opacity-60"
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
      <div className="flex items-center gap-2 border-t border-ink/10 bg-warm-white px-4 py-3 text-sm text-ink/60">
        <div className="w-4 h-4 border-2 border-ocean border-t-transparent rounded-full animate-spin" />
        Running accessibility check…
      </div>
    );
  }

  if (state.phase === 'unavailable') {
    return (
      <div className="border-t border-ink/10 bg-warm-white px-4 py-3 text-sm text-ink/50" role="status">
        Accessibility check unavailable.
      </div>
    );
  }

  const { score, violations } = state;
  const band = scoreBand(score);
  const badgeClass =
    band === 'good'
      ? 'bg-terrain text-white'
      : band === 'mid'
        ? 'bg-gold text-ink'
        : 'bg-compass text-white';

  return (
    <div className="border-t border-ink/10 bg-warm-white px-4 py-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'inline-flex items-baseline gap-1 rounded-lg px-3 py-1.5 font-display font-semibold shadow-sm',
              badgeClass,
            )}
            aria-label={`Accessibility score ${score} out of 100`}
          >
            <span className="text-lg leading-none">{score}</span>
            <span className="text-xs opacity-80">/100</span>
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-ink">Accessibility score</span>
            <span
              className="text-xs text-ink/50"
              title="Automated check via axe-core. Catches roughly half of WCAG issues, not a certification."
            >
              automated check (axe-core){' '}
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
          className="px-3 py-1.5 rounded-lg bg-ocean text-white text-xs font-display font-semibold shadow-sm hover:bg-ocean-dark focus:outline-none focus:ring-2 focus:ring-ocean/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFixing ? 'Fixing…' : 'Fix accessibility'}
        </button>
      </div>

      {violations.length > 0 ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-ink/60 hover:text-ink underline"
            aria-expanded={expanded}
          >
            {expanded ? 'Hide' : 'Show'} {violations.length} violation
            {violations.length === 1 ? '' : 's'}
          </button>
          {expanded && (
            <ul className="mt-2 flex flex-col gap-2">
              {violations.map((v, i) => (
                <li key={`${v.id}-${i}`} className="rounded-lg bg-parchment p-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-mono text-ink">{v.id}</span>
                    {v.impact && (
                      <span
                        className={cn(
                          'text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded',
                          v.impact === 'critical' || v.impact === 'serious'
                            ? 'bg-compass/15 text-compass'
                            : 'bg-gold/20 text-ink/70',
                        )}
                      >
                        {v.impact}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink/70 mt-1">{v.help}</p>
                  <p className="text-[11px] text-ink/40 mt-0.5">
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
      className="px-3 py-1.5 rounded-lg border border-ink/20 text-ink text-xs font-display font-semibold hover:bg-ink/5 focus:outline-none focus:ring-2 focus:ring-compass/40"
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
          style={{ objectFit: 'contain', background: '#F9F6F0' }}
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
    <div className="h-full overflow-y-auto bg-parchment">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-h1 text-ink">Screenshot Studio</h1>
            <p className="text-sm text-ink/70 mt-1">
              Paste, drop, or upload a UI screenshot. Gemini recreates it as a live, editable React
              component grounded in the Trace component catalog.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleDark}
            aria-pressed={dark}
            title="Toggle editor theme"
            className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-ink/20 text-ink text-xs font-display font-semibold hover:bg-ink/5 focus:outline-none focus:ring-2 focus:ring-compass/40"
          >
            {dark ? '☀ Light editor' : '☾ Dark editor'}
          </button>
        </header>

        {!showWorkspace && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={cn(
              'rounded-2xl border-2 border-dashed bg-warm-white p-10 text-center transition-colors',
              isDragging ? 'border-compass bg-compass/5' : 'border-ink/15',
            )}
          >
            <p className="font-display text-lg text-ink">
              {isDragging ? 'Drop to trace it' : 'Drop a screenshot here'}
            </p>
            <p className="text-sm text-ink/60 mt-1">
              Drag in a PNG, paste from your clipboard (Cmd/Ctrl+V), or
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-lg bg-compass text-white text-sm font-display font-semibold shadow-sm hover:bg-compass/90 focus:outline-none focus:ring-2 focus:ring-compass/40"
              >
                Choose file
              </button>
              <button
                type="button"
                onClick={() => void generate(SAMPLE_DATA_URL)}
                className="px-4 py-2 rounded-lg border border-ink/20 text-ink text-sm font-display font-semibold hover:bg-ink/5 focus:outline-none focus:ring-2 focus:ring-compass/40"
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

            {GALLERY_EXAMPLES.length > 0 && (
              <div className="mt-8 border-t border-ink/10 pt-6 text-left">
                <p className="font-display text-sm font-semibold text-ink">
                  Try an example{' '}
                  <span className="ml-2 font-body font-normal text-xs text-ink/50">
                    instant, pre-traced. No upload or API key needed.
                  </span>
                </p>
                <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {GALLERY_EXAMPLES.map((example) => (
                    <li key={example.id}>
                      <button
                        type="button"
                        onClick={() => loadExample(example)}
                        className="group flex w-full flex-col gap-2 rounded-xl border border-ink/15 bg-parchment p-2 text-left transition-colors hover:border-compass focus:outline-none focus:ring-2 focus:ring-compass/40"
                      >
                        <img
                          src={example.thumbnail}
                          alt={`${example.title} example`}
                          loading="lazy"
                          className="h-28 w-full rounded-lg border border-ink/10 bg-white object-cover object-top"
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
        )}

        {showWorkspace && status === 'error' && error && (
          <div
            className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-compass/30 bg-compass/5 px-4 py-3"
            role="alert"
          >
            <div>
              <p className="text-sm font-display font-semibold text-compass">That didn't work</p>
              <p className="text-sm text-ink/70 mt-0.5">{error}</p>
              <p className="text-xs text-ink/50 mt-1">Your generated component is still here. Try again when ready.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStatus('ready');
              }}
              className="flex-shrink-0 text-xs text-ink/60 hover:text-ink underline focus:outline-none focus:ring-2 focus:ring-compass/40 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {showWorkspace && (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr] gap-4">
            {/* LEFT: What the AI sees */}
            <aside className="rounded-2xl border border-ink/10 bg-warm-white p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-ink">What the AI sees</h2>
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs text-ink/60 hover:text-ink underline"
                >
                  New
                </button>
              </div>

              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Uploaded screenshot"
                  className="rounded-lg border border-ink/10 max-h-40 w-full object-contain bg-parchment"
                />
              )}

              {status === 'loading' && (
                <div className="flex items-center gap-3 text-ink/70 text-sm">
                  <div className="w-5 h-5 border-2 border-compass border-t-transparent rounded-full animate-spin" />
                  Detecting components and generating code…
                </div>
              )}

              {result && (
                <>
                  <ul className="flex flex-col gap-3">
                    {result.detections.map((d, i) => (
                      <li key={`${d.label}-${i}`} className="rounded-lg bg-parchment p-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm text-ink font-medium">{d.label}</span>
                          <span className="text-xs font-mono text-compass">
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
                      <li className="text-sm text-ink/50">No components detected.</li>
                    )}
                  </ul>

                  {result.componentsUsed.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">
                        Components used
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.componentsUsed.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded-full bg-compass/10 text-compass text-xs font-mono"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.repairs ? (
                    <p className="text-xs text-ink/50">
                      Auto-repaired {result.repairs} time{result.repairs === 1 ? '' : 's'} before
                      compiling.
                    </p>
                  ) : null}

                  {result.notes && <p className="text-xs text-ink/60 leading-relaxed">{result.notes}</p>}
                </>
              )}
            </aside>

            {/* RIGHT: live, editable preview */}
            <section className="rounded-2xl border border-ink/10 overflow-hidden min-h-[480px] bg-warm-white">
              {status === 'loading' && !code && (
                <div className="flex items-center justify-center h-[480px]">
                  <div className="w-10 h-10 border-4 border-compass border-t-transparent rounded-full animate-spin" />
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
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 bg-warm-white px-4 py-2">
                    <div
                      className="inline-flex rounded-lg border border-ink/15 p-0.5"
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
                            'px-3 py-1 rounded-md text-xs font-display font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-compass/40',
                            rightView === mode
                              ? 'bg-compass text-white shadow-sm'
                              : 'text-ink hover:bg-ink/5',
                          )}
                        >
                          {mode === 'code' ? 'Code + Preview' : 'Compare'}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <CopyCodeButton code={code} />
                      <UnstyledOpenInCodeSandboxButton className="px-3 py-1.5 rounded-lg border border-ink/20 text-ink text-xs font-display font-semibold hover:bg-ink/5 focus:outline-none focus:ring-2 focus:ring-compass/40">
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
                      <p className="border-t border-ink/10 bg-warm-white px-4 py-2 text-center text-xs text-ink/50">
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
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
