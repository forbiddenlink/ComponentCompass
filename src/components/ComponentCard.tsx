import { useState } from 'react';
import { cn } from '../lib/utils';
import { trackComponentCardClick } from '../services/insights';
import { QuickPreview, PREVIEWABLE_COMPONENTS } from './ComponentPreview';
import { PlayIcon } from './Icons';
import componentsData from '../../data/components_index_enhanced.json';

interface ComponentInfo {
  objectID: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  status: string;
  props: string;
  variants: string;
}

const componentLookup = new Map<string, ComponentInfo>(
  (componentsData as ComponentInfo[]).map(c => [c.name.toLowerCase(), c])
);

interface ComponentCardProps {
  componentName: string;
  onAction: (query: string) => void;
}

export function ComponentCard({ componentName, onAction }: ComponentCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const data = componentLookup.get(componentName.toLowerCase());
  if (!data) return null;

  const variants = data.variants.split(',').map(v => v.trim()).filter(Boolean);
  const hasPreview = PREVIEWABLE_COMPONENTS.includes(componentName.toLowerCase());

  const handleAction = (action: string) => {
    trackComponentCardClick(data.name);
    const queries: Record<string, string> = {
      docs: `Show me the ${data.name} component documentation`,
      a11y: `What are the accessibility guidelines for ${data.name}?`,
      examples: `Show me code examples for ${data.name}`,
      variants: `What variants does ${data.name} have and when should I use each?`,
    };
    onAction(queries[action] || `Tell me about ${data.name}`);
  };

  const statusColor = data.status === 'stable'
    ? 'bg-terrain/10 text-terrain'
    : data.status === 'beta'
    ? 'bg-gold/10 text-gold'
    : 'bg-compass/10 text-compass';

  return (
    <div className="my-3 border border-ink/10 bg-white rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-ink/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-semibold text-ink text-small">{data.name}</span>
          <span className={cn('text-caption px-1.5 py-0.5 rounded font-semibold', statusColor)}>
            {data.status}
          </span>
          {hasPreview && (
            <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 bg-terrain/15 text-terrain rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-terrain" />
              Live Preview
            </span>
          )}
        </div>
        <span className="text-caption text-muted font-mono uppercase tracking-wider">{data.category}</span>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <p className="text-small text-ink/70 leading-relaxed">{data.description}</p>

        {/* Variants */}
        {variants.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {variants.map(v => (
              <span key={v} className="text-caption px-1.5 py-0.5 bg-ink/5 text-ink/60 rounded font-mono">
                {v}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Live Preview Section */}
      {showPreview && hasPreview && (
        <div className="border-t border-ink/8">
          <QuickPreview componentName={componentName} />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2.5 border-t border-ink/8 flex gap-2">
        <button
          type="button"
          onClick={() => handleAction('docs')}
          className="text-caption px-3 py-1.5 bg-compass text-white rounded hover:bg-compass-dark transition-colors font-semibold focus-ring"
        >
          View Docs
        </button>
        <button
          type="button"
          onClick={() => handleAction('examples')}
          className="text-caption px-3 py-1.5 border border-ink/15 text-ink rounded hover:bg-ink/5 transition-colors font-semibold focus-ring"
        >
          Examples
        </button>
        {hasPreview && (
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              "text-caption px-3 py-1.5 rounded transition-colors font-semibold focus-ring flex items-center gap-1.5",
              showPreview
                ? "bg-terrain text-white hover:bg-terrain-dark"
                : "border border-terrain/30 text-terrain hover:bg-terrain/5"
            )}
          >
            <PlayIcon className="w-3.5 h-3.5" />
            {showPreview ? 'Hide Preview' : 'Try It'}
          </button>
        )}
      </div>
    </div>
  );
}

// Exported for use by ChatInterface to detect component names
export const KNOWN_COMPONENTS = Array.from(componentLookup.keys());
