import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { cn } from '../lib/utils';
import { imageToBase64 } from '../services/vision';

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

export function ScreenshotStudio() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<GenResult | null>(null);
  const [code, setCode] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generate = useCallback(
    async (dataUrl: string, repair?: { previousJsx: string; errorMessage: string }) => {
      setStatus('loading');
      setError(null);
      setResult(null);
      setImageUrl(dataUrl);
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageDataUrl: dataUrl, ...repair }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: 'Generation failed' }));
          throw new Error(body.error || `Generation API error (${res.status})`);
        }
        const data: GenResult = await res.json();
        setResult(data);
        setCode(data.jsx);
        setStatus('ready');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Generation failed');
        setStatus('error');
      }
    },
    [],
  );

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

  const showWorkspace = status === 'loading' || status === 'ready';

  return (
    <div className="h-full overflow-y-auto bg-parchment">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="font-display text-h1 text-ink">Screenshot Studio</h1>
          <p className="text-sm text-ink/70 mt-1">
            Paste, drop, or upload a UI screenshot. Gemini recreates it as a live, editable React
            component grounded in the Trace component catalog.
          </p>
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
            <p className="font-display text-lg text-ink">Drop a screenshot here</p>
            <p className="text-sm text-ink/60 mt-1">
              or paste from clipboard (Cmd/Ctrl+V), or
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
                Try a sample
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

              {status === 'ready' && result && (
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
              {status === 'loading' && (
                <div className="flex items-center justify-center h-[480px]">
                  <div className="w-10 h-10 border-4 border-compass border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {status === 'ready' && code && (
                <SandpackProvider
                  template="react-ts"
                  files={{ '/App.tsx': { code } }}
                  options={{ externalResources: ['https://cdn.tailwindcss.com'] }}
                  customSetup={{ dependencies: { 'lucide-react': 'latest' } }}
                >
                  <SandpackLayout>
                    <SandpackPreview showSandpackErrorOverlay style={{ height: 480 }} />
                    <SandpackCodeEditor showLineNumbers style={{ height: 480 }} />
                  </SandpackLayout>
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
