# Trace

An AI-powered design system navigator built for the [Algolia Agent Studio Challenge](https://www.algolia.com/blog/ai-agents-challenge/). Trace lets developers discover UI components, explore code implementations, and check accessibility guidelines through natural conversation.

## What It Does

Ask questions in plain English and get comprehensive answers drawn from multiple Algolia indices:

- **Components** -- Browse the full component catalog with props, variants, and usage guidance
- **Code** -- Get real shadcn/ui source code with syntax highlighting and one-click copy
- **Accessibility** -- WCAG AA guidelines, ARIA attributes, keyboard support, and common mistakes
- **Screenshot Analysis** -- Upload a design mockup and GPT-4 Vision identifies matching components

## How It Works

```
User question
     |
     v
Algolia Agent Studio (gpt-4-turbo)
     |
     +---> components_index
     +---> code_implementations_index
     +---> accessibility_index
     |
     v
Streamed response with sources
```

The Agent Studio agent orchestrates searches across specialized Algolia indices, then synthesizes results into a conversational response streamed to the browser via SSE.

## Quick Start

```bash
npm install
cp .env.example .env   # fill in your Algolia credentials
node scripts/upload-enhanced.mjs
npm run dev
```

Open http://localhost:5173

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_ALGOLIA_APP_ID` | Yes | Algolia Application ID |
| `VITE_ALGOLIA_SEARCH_API_KEY` | Yes | Algolia Search API Key |
| `VITE_ALGOLIA_AGENT_ID` | Yes | Agent Studio Agent ID |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | Google Gemini key for screenshot analysis (server-side, used by `/api/vision`) |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19, TypeScript 5.9, Vite 7 |
| Styling | Tailwind CSS 3.4 |
| AI/Search | Algolia Agent Studio |
| Streaming | AI SDK 6 (`@ai-sdk/react`) with SSE fallback |
| Code Display | prism-react-renderer |
| Vision | Google Gemini (`gemini-2.0-flash`) |

## Project Structure

```
src/
  components/
    ChatInterface.tsx      Main conversational UI
    CodeBlock.tsx          Syntax highlighting + quick actions
    ComponentCard.tsx      Interactive component cards
    FeedbackButtons.tsx    User feedback tracking
    ErrorBoundary.tsx      Error handling with helpful messages
    Icons.tsx              20 custom SVG icons
  services/
    algolia.ts             Agent Studio client (streaming + SSE fallback)
    vision.ts              GPT-4 Vision screenshot analysis
    insights.ts            Algolia Insights tracking
  lib/
    env.ts                 Environment validation
    utils.ts               Utility functions
  test/
    setup.ts               Test configuration
data/                      Algolia index seed data
scripts/                   Upload and test utilities
```

## Design

Trace uses a vintage cartographic theme:

- **Parchment** (#F9F6F0) background with map texture
- **Compass** (#C84B31) accent for interactive elements
- **Ocean** (#1A535C) for secondary actions
- **Gold** (#D4AF37) for decorative accents
- Custom fonts: Fraunces (display), Epilogue (body), JetBrains Mono (code)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift+Enter` | New line |
| `Cmd+K` | New conversation |
| `Cmd+E` | Export to Markdown |
| `Cmd+/` | Toggle session stats |

## Testing

```bash
npm test              # Run all tests
npm test:ui           # Run tests with UI
npm test:coverage     # Generate coverage report
```

- **24 passing tests** across 4 test suites
- Unit tests for components, services, and utilities
- Vitest + React Testing Library
- Full mocking for API calls and environment

## Code Quality

- ✅ **Zero ESLint errors** - Strict TypeScript configuration
- ✅ **WCAG 2.1 AA compliant** - Full accessibility support
- ✅ **Optimized bundle** - Code splitting reduces initial load by 67%
- ✅ **Type-safe** - Strict mode enabled throughout
- ✅ **Tested** - 24/24 tests passing

See `IMPROVEMENTS.md` for detailed list of optimizations and `ACCESSIBILITY.md` for accessibility compliance.

## Contest Criteria

| Criteria | Weight | Implementation |
|----------|--------|----------------|
| Use of Technology | 40% | Multi-index Agent Studio orchestration, streaming SSE, real shadcn/ui data |
| UX | 25% | Responsive design, loading states, session persistence, conversation export |
| Creativity | 20% | Cartographic theme, 20 custom SVG icons, screenshot-to-component workflow |
| Innovation | 15% | Multimodal AI (text + vision), contextual follow-up suggestions, code quick actions |

---

Built by Elizabeth Stein for the Algolia Agent Studio Challenge -- February 2026
