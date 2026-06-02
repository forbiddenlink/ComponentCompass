/** @type {import('tailwindcss').Config} */
// Trace — "Precision Drafting" design system.
// Palette: warm vellum paper, graphite ink, red-pencil vermilion (primary accent),
// blueprint indigo (secondary accent, used sparingly). Tinted neutrals — never pure
// #fff / #000. Token KEYS are preserved from the prior system so every consumer keeps
// compiling; only the VALUES changed to the drafting palette.
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // ── Paper / surfaces (warm vellum, never pure white) ──
                parchment: '#F4F1EA',     // base canvas — warm vellum
                'warm-white': '#FBFAF5',  // elevated surface — lighter vellum
                vellum: '#F4F1EA',
                surface: '#FBFAF5',

                // ── Ink / text (graphite, tinted warm-cool, all >=4.5:1 on vellum) ──
                ink: '#1F2933',           // primary text — graphite ink (~13:1 on vellum)
                'deep-charcoal': '#161C22',
                graphite: '#3A4654',      // secondary ink
                muted: '#5A6672',         // tertiary text — darkened for >=4.5:1 (was #7A8B8C)

                // ── Primary accent: red-pencil vermilion ──
                compass: {
                    DEFAULT: '#C5482E',   // vermilion — primary accent (4.5:1+ on vellum)
                    dark: '#A23A23',
                    light: '#D9694F',
                },
                vermilion: {
                    DEFAULT: '#C5482E',
                    dark: '#A23A23',
                    light: '#D9694F',
                },

                // ── Secondary accent: blueprint indigo (used sparingly) ──
                ocean: {
                    DEFAULT: '#27496D',   // blueprint indigo
                    dark: '#1C3650',
                    light: '#E5EAF1',
                },
                blueprint: {
                    DEFAULT: '#27496D',
                    dark: '#1C3650',
                    light: '#E5EAF1',
                },

                // ── Status: surveyor green (good) + ochre (mid/warning) ──
                terrain: {
                    DEFAULT: '#3C6E47',   // muted surveyor green — success
                    dark: '#2C5235',
                    light: '#E7EEE8',
                },
                gold: {
                    DEFAULT: '#9A6B12',   // drafting ochre — warning (darkened for contrast on light)
                    muted: '#C99A3A',
                    light: '#F6EFDD',
                },

                // ── Construction-line ink (the line-work motif) ──
                'line-strong': 'rgba(31, 41, 51, 0.22)',
                'line-soft': 'rgba(31, 41, 51, 0.10)',
                'line-faint': 'rgba(31, 41, 51, 0.05)',
            },
            fontFamily: {
                // Display = refined technical grotesque. Body = clean humanist sans.
                // Mono reserved for code + raw numeric data only.
                display: ["'Space Grotesk'", 'ui-sans-serif', 'system-ui', 'sans-serif'],
                body: ["'Public Sans'", 'ui-sans-serif', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
            },
            letterSpacing: {
                // Annotation micro-labels read as small-caps technical tags.
                annotate: '0.14em',
            },
            fontSize: {
                // Modular scale (~1.2 minor third), measured for a technical instrument.
                'display': ['clamp(2rem, 4.5vw, 3rem)', { lineHeight: '1.04', fontWeight: '600', letterSpacing: '-0.02em' }],
                'h1': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.12', fontWeight: '600', letterSpacing: '-0.015em' }],
                'h2': ['clamp(1.2rem, 2.4vw, 1.5rem)', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.01em' }],
                'h3': ['1.0625rem', { lineHeight: '1.3', fontWeight: '600' }],
                'body': ['clamp(0.875rem, 1.4vw, 0.9375rem)', { lineHeight: '1.6', fontWeight: '400' }],
                'small': ['0.8125rem', { lineHeight: '1.5', fontWeight: '450' }],
                'caption': ['0.6875rem', { lineHeight: '1.35', fontWeight: '600' }],
                // Annotation label: tiny, tracked, small-caps technical tag.
                'annotate': ['0.625rem', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '0.14em' }],
            },
            spacing: {
                '4.5': '1.125rem',
                '18': '4.5rem',
            },
            borderRadius: {
                // Drafting surfaces are crisp: hairline corners, not pillowy.
                'none': '0',
                'DEFAULT': '3px',
                'sm': '2px',
                'md': '4px',
                'lg': '5px',
                'xl': '8px',
                '2xl': '10px',
            },
            borderWidth: {
                hair: '0.5px',
            },
            keyframes: {
                'bounce-typing': {
                    '0%, 80%, 100%': { transform: 'translateY(0)' },
                    '40%': { transform: 'translateY(-6px)' },
                },
                'slide-in': {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'slide-up': {
                    from: { opacity: '0', transform: 'translateY(16px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in-right': {
                    from: { opacity: '0', transform: 'translateX(12px)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                'slide-in-top': {
                    from: { opacity: '0', transform: 'translateY(-6px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'bounce-type': 'bounce-typing 1.4s infinite',
                'slide-in': 'slide-in 0.2s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                'slide-up': 'slide-up 0.25s ease-out',
                'slide-in-right': 'slide-in-right 0.2s ease-out',
                'slide-in-top': 'slide-in-top 0.2s ease-out',
            },
            boxShadow: {
                // Paper sits flat on a table — shadows are faint, low, cool-graphite.
                'xs': '0 1px 1px rgba(31,41,51,0.04)',
                'sm': '0 1px 2px rgba(31,41,51,0.05)',
                'DEFAULT': '0 1px 3px rgba(31,41,51,0.06)',
                'md': '0 2px 6px rgba(31,41,51,0.07)',
                'lg': '0 6px 18px rgba(31,41,51,0.08)',
            },
            transitionDuration: {
                DEFAULT: '150ms',
            },
            transitionTimingFunction: {
                // Reveal curve (ease-out-quint) for content entering — slow settle, no bounce.
                draft: 'cubic-bezier(0.23, 1, 0.32, 1)',
                // UI curve for fast interactive transitions (toggles, hovers).
                ui: 'cubic-bezier(0.32, 0.72, 0, 1)',
            },
        },
    },
    plugins: [],
}
