import { lazy, Suspense, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { hasAlgolia } from './lib/env';
import { cn } from './lib/utils';

// Lazy load the main views for faster initial load
const ChatInterface = lazy(() => import('./components/ChatInterface').then(m => ({ default: m.ChatInterface })));
const ComponentExplorer = lazy(() => import('./components/ComponentExplorer').then(m => ({ default: m.ComponentExplorer })));
const ScreenshotStudio = lazy(() => import('./components/ScreenshotStudio').then(m => ({ default: m.ScreenshotStudio })));

type View = 'studio' | 'chat' | 'explore';

// Chat is powered by Algolia. Only offer it when Algolia creds are present;
// Studio (Google key) and Explore (static catalog) always work.
const ALGOLIA_AVAILABLE = hasAlgolia();

const TABS: { id: View; label: string }[] = [
  { id: 'studio', label: 'Studio' },
  ...(ALGOLIA_AVAILABLE ? [{ id: 'chat' as const, label: 'Chat' }] : []),
  { id: 'explore', label: 'Explore' },
];

function App() {
  const [view, setView] = useState<View>('studio');

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const currentIndex = TABS.findIndex((t) => t.id === view);
    const delta = e.key === 'ArrowRight' ? 1 : -1;
    const next = TABS[(currentIndex + delta + TABS.length) % TABS.length];
    setView(next.id);
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen h-[100dvh] bg-parchment">
        {/* Top bar: wordmark + tabs, hairline-ruled. */}
        <header className="flex items-center gap-6 px-5 h-14 border-b-hair border-line-strong bg-warm-white flex-shrink-0">
          <TraceWordmark />

          <div className="hidden sm:block h-5 w-px bg-line-default" aria-hidden="true" />

          <nav
            role="tablist"
            aria-label="View"
            className="flex items-stretch self-stretch"
          >
            {TABS.map((tab) => {
              const isActive = view === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setView(tab.id)}
                  onKeyDown={handleTabKeyDown}
                  className={cn(
                    'relative px-4 text-small font-display font-medium tracking-tight transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-compass/40',
                    'after:absolute after:left-3 after:right-3 after:-bottom-px after:h-px after:transition-colors',
                    isActive
                      ? 'text-ink after:bg-compass'
                      : 'text-muted hover:text-ink after:bg-transparent'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <span className="ml-auto annotate hidden md:inline">screenshot to component</span>
        </header>

        {/* View */}
        <div className="flex-1 min-h-0">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full bg-parchment">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-4 border-2 border-compass border-t-transparent rounded-full animate-spin"></div>
                <p className="annotate">loading trace</p>
              </div>
            </div>
          }>
            {view === 'studio' ? (
              <ScreenshotStudio />
            ) : view === 'chat' ? (
              <ChatInterface />
            ) : (
              <ComponentExplorer />
            )}
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
}

/**
 * Trace wordmark + logomark. The mark is a "trace" glyph: a dot (origin) that
 * draws out into a construction line and lands on a reticle (target) — origin →
 * trace → resolved component. Drawn as inline SVG so it scales crisply.
 */
function TraceWordmark() {
  return (
    <div className="flex items-center gap-2.5 select-none" aria-label="Trace">
      <svg
        width="30"
        height="20"
        viewBox="0 0 30 20"
        fill="none"
        aria-hidden="true"
        className="flex-shrink-0"
      >
        {/* origin dot */}
        <circle cx="3" cy="10" r="2.5" fill="#C5482E" />
        {/* trace / construction line */}
        <line x1="6" y1="10" x2="21" y2="10" stroke="#27496D" strokeWidth="1" strokeDasharray="2 2" />
        {/* reticle target */}
        <circle cx="24" cy="10" r="4.5" stroke="#1F2933" strokeWidth="1" fill="none" />
        <line x1="24" y1="3.5" x2="24" y2="6.5" stroke="#1F2933" strokeWidth="1" />
        <line x1="24" y1="13.5" x2="24" y2="16.5" stroke="#1F2933" strokeWidth="1" />
        <line x1="17.5" y1="10" x2="20" y2="10" stroke="#1F2933" strokeWidth="1" />
        <line x1="28" y1="10" x2="30" y2="10" stroke="#1F2933" strokeWidth="1" />
      </svg>
      <span className="font-display text-base font-bold tracking-tight text-ink lowercase">
        trace
      </span>
    </div>
  );
}

export default App;
