/**
 * Manages npm dependencies for Sandpack preview
 */

export interface DependencyConfig {
    name: string;
    version: string;
    required?: boolean;
}

// Base dependencies always included in previews
export const BASE_DEPENDENCIES: Record<string, string> = {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
};

// Optional dependencies that can be added per-component
export const OPTIONAL_DEPENDENCIES: Record<string, DependencyConfig> = {
    'framer-motion': {
        name: 'framer-motion',
        version: '^11.0.0',
    },
    'lucide-react': {
        name: 'lucide-react',
        version: '^0.300.0',
    },
    '@radix-ui/react-slot': {
        name: '@radix-ui/react-slot',
        version: '^1.0.2',
    },
    'class-variance-authority': {
        name: 'class-variance-authority',
        version: '^0.7.0',
    },
    clsx: {
        name: 'clsx',
        version: '^2.1.0',
    },
    'tailwind-merge': {
        name: 'tailwind-merge',
        version: '^2.0.0',
    },
};

// Detect dependencies from code
export function detectDependencies(code: string): string[] {
    const deps: string[] = [];

    // Check for common import patterns
    const importRegex = /import\s+(?:[\w\s{},*]+from\s+)?['"]([^'"./][^'"]+)['"]/g;
    let match: RegExpExecArray | null;

    while ((match = importRegex.exec(code)) !== null) {
        const pkg = match[1];
        // Extract package name (handle scoped packages)
        const pkgName = pkg.startsWith('@')
            ? pkg.split('/').slice(0, 2).join('/')
            : pkg.split('/')[0];

        if (
            pkgName &&
            !pkgName.startsWith('react') &&
            !deps.includes(pkgName)
        ) {
            deps.push(pkgName);
        }
    }

    return deps;
}

// Build dependencies object for Sandpack
export function buildDependencies(
    code: string,
    additionalDeps?: Record<string, string>
): Record<string, string> {
    const detected = detectDependencies(code);
    const deps: Record<string, string> = { ...BASE_DEPENDENCIES };

    // Add detected dependencies from optional list
    for (const dep of detected) {
        if (OPTIONAL_DEPENDENCIES[dep]) {
            deps[dep] = OPTIONAL_DEPENDENCIES[dep].version;
        }
    }

    // Add any additional dependencies
    if (additionalDeps) {
        Object.assign(deps, additionalDeps);
    }

    return deps;
}

// Export list of all available dependency names
export const AVAILABLE_DEPENDENCIES = Object.keys(OPTIONAL_DEPENDENCIES);
