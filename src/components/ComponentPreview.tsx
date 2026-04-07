/**
 * ComponentPreview - Sandpack-based live component preview
 *
 * This module provides live, interactive component previews with:
 * - Editable code with syntax highlighting
 * - Live preview with hot reload
 * - Console output panel
 * - Dark/light theme toggle
 * - Export to CodeSandbox
 * - Multiple file support
 *
 * @example
 * // Basic usage
 * <ComponentPreview componentName="Button" />
 *
 * // With custom code
 * <ComponentPreview componentName="Custom" customCode={myCode} />
 *
 * // Preview only (no editor)
 * <QuickPreview componentName="Card" />
 */

// Re-export everything from the modular preview system
export {
    ComponentPreview,
    QuickPreview,
    PREVIEWABLE_COMPONENTS,
    COMPONENT_TEMPLATES,
} from './preview/ComponentPreview';

export { CodeEditor } from './preview/CodeEditor';
export { PreviewPane } from './preview/PreviewPane';
export { PreviewErrorBoundary } from './preview/ErrorBoundary';

// Re-export utilities for external use
export {
    getTemplate,
    hasTemplate,
} from '../lib/preview/templates';

export {
    buildDependencies,
    detectDependencies,
} from '../lib/preview/dependencies';

export {
    processForSandpack,
    ensureDefaultExport,
    stripTypeScript,
} from '../lib/preview/transform';
