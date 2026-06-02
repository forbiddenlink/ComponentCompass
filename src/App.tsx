import { lazy, Suspense, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { cn } from './lib/utils';

// Lazy load the main views for faster initial load
const ChatInterface = lazy(() => import('./components/ChatInterface').then(m => ({ default: m.ChatInterface })));
const ComponentExplorer = lazy(() => import('./components/ComponentExplorer').then(m => ({ default: m.ComponentExplorer })));
const ScreenshotStudio = lazy(() => import('./components/ScreenshotStudio').then(m => ({ default: m.ScreenshotStudio })));

type View = 'studio' | 'chat' | 'explore';

const TABS: { id: View; label: string }[] = [
  { id: 'studio', label: 'Studio' },
  { id: 'chat', label: 'Chat' },
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
        {/* Top tab bar */}
        <div
          role="tablist"
          aria-label="View"
          className="flex items-center gap-1 px-4 py-2 border-b border-ink/10 bg-warm-white flex-shrink-0"
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
                  'px-4 py-1.5 text-sm font-display font-semibold rounded-lg transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-compass/40',
                  isActive
                    ? 'bg-compass text-white shadow-sm'
                    : 'text-ink hover:bg-ink/5'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* View */}
        <div className="flex-1 min-h-0">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full bg-parchment">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-compass border-t-transparent rounded-full animate-spin"></div>
                <p className="text-ink font-semibold">Loading Trace...</p>
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

export default App;
