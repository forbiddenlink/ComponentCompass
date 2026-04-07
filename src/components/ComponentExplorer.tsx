import { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import { ComponentPreview, PREVIEWABLE_COMPONENTS } from './ComponentPreview';
import { CompassIcon, NavigationIcon, SearchIcon } from './Icons';
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

const components = componentsData as ComponentInfo[];

// Category colors for visual grouping
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    Forms: { bg: 'bg-compass/10', text: 'text-compass', border: 'border-compass/30' },
    Layout: { bg: 'bg-ocean/10', text: 'text-ocean', border: 'border-ocean/30' },
    Overlay: { bg: 'bg-gold/10', text: 'text-gold-dark', border: 'border-gold/30' },
    'Data Display': { bg: 'bg-terrain/10', text: 'text-terrain', border: 'border-terrain/30' },
    Navigation: { bg: 'bg-ink/10', text: 'text-ink', border: 'border-ink/20' },
    Feedback: { bg: 'bg-compass/10', text: 'text-compass-dark', border: 'border-compass/20' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    stable: { bg: 'bg-terrain/15', text: 'text-terrain' },
    beta: { bg: 'bg-gold/15', text: 'text-gold-dark' },
    deprecated: { bg: 'bg-compass/15', text: 'text-compass' },
};

interface ComponentExplorerProps {
    onClose?: () => void;
    onComponentSelect?: (name: string) => void;
    initialComponent?: string;
}

export function ComponentExplorer({
    onClose,
    onComponentSelect,
    initialComponent,
}: ComponentExplorerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedComponent, setSelectedComponent] = useState<string | null>(
        initialComponent || null
    );
    const [showOnlyPreviewable, setShowOnlyPreviewable] = useState(false);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(components.map((c) => c.category));
        return Array.from(cats).sort();
    }, []);

    // Filter components based on search and category
    const filteredComponents = useMemo(() => {
        return components.filter((comp) => {
            const matchesSearch =
                !searchQuery ||
                comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                comp.tags.some((tag) =>
                    tag.toLowerCase().includes(searchQuery.toLowerCase())
                );

            const matchesCategory =
                !selectedCategory || comp.category === selectedCategory;

            const matchesPreviewable =
                !showOnlyPreviewable ||
                PREVIEWABLE_COMPONENTS.includes(comp.name.toLowerCase());

            return matchesSearch && matchesCategory && matchesPreviewable;
        });
    }, [searchQuery, selectedCategory, showOnlyPreviewable]);

    const selectedComponentData = useMemo(() => {
        return components.find(
            (c) => c.name.toLowerCase() === selectedComponent?.toLowerCase()
        );
    }, [selectedComponent]);

    const handleComponentClick = (name: string) => {
        setSelectedComponent(name);
        onComponentSelect?.(name);
    };

    return (
        <div className="flex flex-col h-full bg-parchment">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink/10 bg-warm-white">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 wax-seal rounded-full flex items-center justify-center">
                        <CompassIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-display font-semibold text-ink">
                            Component Explorer
                        </h2>
                        <p className="text-caption text-muted">
                            {filteredComponents.length} components available
                        </p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 text-muted hover:text-ink hover:bg-ink/5 rounded-lg transition-colors"
                        aria-label="Close explorer"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Search and Filters */}
            <div className="px-4 py-3 border-b border-ink/10 bg-warm-white space-y-3">
                {/* Search Input */}
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search components..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-ink/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-compass/30 focus:border-compass/50 transition-all"
                    />
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={cn(
                            'px-3 py-1.5 text-caption font-semibold rounded-full transition-colors',
                            selectedCategory === null
                                ? 'bg-ink text-white'
                                : 'bg-ink/5 text-ink hover:bg-ink/10'
                        )}
                    >
                        All
                    </button>
                    {categories.map((cat) => {
                        const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Navigation;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                                className={cn(
                                    'px-3 py-1.5 text-caption font-semibold rounded-full transition-colors border',
                                    selectedCategory === cat
                                        ? `${colors.bg} ${colors.text} ${colors.border}`
                                        : 'bg-white text-muted border-ink/10 hover:bg-ink/5'
                                )}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>

                {/* Preview Filter Toggle */}
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showOnlyPreviewable}
                        onChange={(e) => setShowOnlyPreviewable(e.target.checked)}
                        className="w-4 h-4 rounded border-ink/30 text-compass focus:ring-compass/30"
                    />
                    Show only components with live preview
                </label>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Component List */}
                <div className="w-80 flex-shrink-0 border-r border-ink/10 overflow-y-auto">
                    <div className="p-2 space-y-1">
                        {filteredComponents.map((comp) => {
                            const isSelected = selectedComponent?.toLowerCase() === comp.name.toLowerCase();
                            const hasPreview = PREVIEWABLE_COMPONENTS.includes(comp.name.toLowerCase());
                            const statusColors = STATUS_COLORS[comp.status] || STATUS_COLORS.stable;

                            return (
                                <button
                                    key={comp.objectID}
                                    onClick={() => handleComponentClick(comp.name)}
                                    className={cn(
                                        'w-full text-left px-3 py-2.5 rounded-lg transition-all',
                                        isSelected
                                            ? 'bg-compass/10 border border-compass/30'
                                            : 'hover:bg-ink/5 border border-transparent'
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    'font-semibold text-sm truncate',
                                                    isSelected ? 'text-compass' : 'text-ink'
                                                )}>
                                                    {comp.name}
                                                </span>
                                                {hasPreview && (
                                                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-terrain" title="Live preview available" />
                                                )}
                                            </div>
                                            <p className="text-caption text-muted truncate mt-0.5">
                                                {comp.description.slice(0, 50)}...
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            <span className={cn(
                                                'text-[10px] font-semibold px-1.5 py-0.5 rounded',
                                                statusColors.bg, statusColors.text
                                            )}>
                                                {comp.status}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}

                        {filteredComponents.length === 0 && (
                            <div className="text-center py-8 text-muted">
                                <p className="text-sm">No components found</p>
                                <p className="text-caption mt-1">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Component Detail / Preview */}
                <div className="flex-1 overflow-y-auto">
                    {selectedComponentData ? (
                        <div className="p-6 space-y-6">
                            {/* Component Header */}
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-display font-semibold text-ink">
                                        {selectedComponentData.name}
                                    </h3>
                                    <span className={cn(
                                        'text-caption font-semibold px-2 py-0.5 rounded',
                                        STATUS_COLORS[selectedComponentData.status]?.bg,
                                        STATUS_COLORS[selectedComponentData.status]?.text
                                    )}>
                                        {selectedComponentData.status}
                                    </span>
                                </div>
                                <p className="text-body text-ink/70">
                                    {selectedComponentData.description}
                                </p>
                            </div>

                            {/* Category & Tags */}
                            <div className="flex flex-wrap gap-2">
                                <span className={cn(
                                    'px-2.5 py-1 text-caption font-semibold rounded border',
                                    CATEGORY_COLORS[selectedComponentData.category]?.bg,
                                    CATEGORY_COLORS[selectedComponentData.category]?.text,
                                    CATEGORY_COLORS[selectedComponentData.category]?.border
                                )}>
                                    {selectedComponentData.category}
                                </span>
                                {selectedComponentData.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-2.5 py-1 text-caption bg-ink/5 text-muted rounded"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Props */}
                            {selectedComponentData.props && (
                                <div>
                                    <h4 className="text-sm font-semibold text-ink mb-2">Props</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedComponentData.props.split(',').map((prop) => (
                                            <code
                                                key={prop.trim()}
                                                className="px-2 py-0.5 text-caption font-mono bg-ink/10 text-ink rounded"
                                            >
                                                {prop.trim()}
                                            </code>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Variants */}
                            {selectedComponentData.variants && (
                                <div>
                                    <h4 className="text-sm font-semibold text-ink mb-2">Variants</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedComponentData.variants.split(',').map((variant) => (
                                            <span
                                                key={variant.trim()}
                                                className="px-2.5 py-1 text-caption font-medium bg-compass/10 text-compass rounded"
                                            >
                                                {variant.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Live Preview */}
                            {PREVIEWABLE_COMPONENTS.includes(selectedComponentData.name.toLowerCase()) ? (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <h4 className="text-sm font-semibold text-ink">Live Preview</h4>
                                        <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-terrain/15 text-terrain rounded">
                                            <span className="w-1.5 h-1.5 rounded-full bg-terrain animate-pulse" />
                                            Interactive
                                        </span>
                                    </div>
                                    <ComponentPreview
                                        componentName={selectedComponentData.name}
                                        showEditor={true}
                                        height="450px"
                                    />
                                </div>
                            ) : (
                                <div className="p-8 bg-ink/5 rounded-lg text-center">
                                    <NavigationIcon className="w-8 h-8 text-muted mx-auto mb-3" />
                                    <p className="text-sm text-muted">
                                        Live preview coming soon for {selectedComponentData.name}
                                    </p>
                                    <p className="text-caption text-muted/70 mt-1">
                                        Ask the Compass for code examples in the chat
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <CompassIcon className="w-12 h-12 text-muted/30 mb-4" />
                            <h3 className="text-lg font-semibold text-ink mb-2">
                                Select a Component
                            </h3>
                            <p className="text-sm text-muted max-w-sm">
                                Choose a component from the list to view its details, props, variants, and live preview.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
