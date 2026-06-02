# Trace - UI/UX Specifications

## Design Theme: Cartographic / Vintage Map Aesthetic

Trace uses a distinctive **vintage cartography** metaphor throughout its design, positioning the AI as a navigator charting the territories of a design system.

### Theme Elements
- **Wax seal** logo treatment (compass icon in a round seal)
- **Parchment** and **warm white** background textures
- **Decorative corner marks** on cards and code blocks
- **Journey connectors** between messages (dotted-line paths)
- **Topographic background pattern** (CSS-generated)
- **Map-texture overlays** on surfaces
- **Compass rose** spinning animation during loading

---

## Design Principles

1. **Minimal Cognitive Load**: Answers are clear, code is copy-pasteable
2. **Progressive Disclosure**: Show essentials first, details on request
3. **Accessible First**: WCAG AA compliant interface
4. **Fast Feedback**: Visual confirmation of actions, instant responses
5. **Cartographic Delight**: Themed interactions that reinforce the explorer metaphor

---

## Visual Design System

### Color Palette

```
Parchment:       #F9F6F0  (primary background)
Warm White:      #FFF9F0  (header/footer background)
Ink:             #2C3E50  (primary text)
Deep Charcoal:   #1A1D23  (code block background)

Compass:         #C84B31  (primary accent / CTA)
Compass Dark:    #A63D2A  (hover states)
Compass Light:   #D85740  (active states)

Ocean:           #1A535C  (secondary accent / user messages)
Ocean Dark:      #14424A  (hover states)

Terrain:         #4E6E58  (tertiary accent / labels)
Terrain Dark:    #3D5246  (hover states)

Gold:            #D4AF37  (highlights / badges)
Gold Muted:      #F9E5C7  (subtle backgrounds)
```

### Typography

**Font Families**:
- Display: `Fraunces` (serif) - Headings, brand text
- Body: `Epilogue` (sans-serif) - UI text, messages
- Code: `JetBrains Mono` / `Fira Code` (monospace)

**Font Sizes**:
```
10px  - Timestamps, keyboard shortcuts, micro labels
12px  - Captions, meta, index labels
14px  - Body small, labels, stats
16px  - Body default, message text
18px  - Body large, card titles
20px  - Section headings
24px  - Page subtitle
30px+ - Hero headings (mobile)
48px+ - Hero headings (desktop)
```

### Custom Shadows
```
Paper Shadow:   0 2px 4px rgba(44,62,80,0.08),
                0 4px 8px rgba(44,62,80,0.06),
                0 8px 16px rgba(44,62,80,0.04),
                inset 0 1px 0 rgba(255,255,255,0.5)

Wax Seal:       inset 0 -2px 4px rgba(0,0,0,0.3),
                0 2px 8px rgba(200,75,49,0.4)
```

### Custom Animations
```
Compass Spin:     compass-rotate 20s linear infinite
Bounce Typing:    bounce-typing 1.4s infinite (staggered)
Slide In:         slide-in 0.3s ease-out
Fade In:          fade-in 0.5s ease-out
Slide Up:         slide-up 0.3s ease-out
Draw Path:        draw-path 2s linear infinite
Gradient BG:      gradient-bg 15s ease-in-out infinite
```

---

## Component Specifications (Implemented)

### Header
- Warm white background with map-texture overlay
- Decorative compass corner marks (desktop only)
- Wax-seal compass logo (animated pulse when loading)
- "Trace" in Fraunces display font
- "Navigate Your Design System" tagline in uppercase tracking
- Action buttons: Session Map, Export, New Route
- "Algolia Agent Studio" badge (desktop only)

### Welcome Screen
- Large wax-seal compass with ping animation
- "Chart Your Course" hero heading
- 4 suggested prompt cards in 2x2 grid
- Each card: colored icon, title, description, hover effects
- Cards: ocean (accessible buttons), terrain (card component), compass (screenshot analysis), gold (design tokens)

### Message Bubbles
- **User messages**: Ocean background, white text, ink border
- **Assistant messages**: White/95 background, ink text, map-texture, paper-shadow
- Corner decorative marks on assistant messages
- Timestamps in mono font: `USER/COMPASS . HH:MM`
- Code blocks rendered via CodeBlock component
- Inline code: ink background with compass-colored text

### Code Block Component
- Deep charcoal background (#1A1D23)
- Compass-colored decorative corner marks (desktop)
- Header: vintage document indicators (gold squares), language label, copy button
- Line numbers in terrain color
- Hover line highlight with compass left-border
- Quick action buttons below: View Docs, Check A11y, Variants, Storybook
- Copy button with wax-seal styling

### Loading State
- Compass icon spinning with "NAVIGATING..." label
- "Charting design system territories..." message
- Typing indicator (3 bouncing compass-colored dots)
- Skeleton content lines
- Progressive index search indicators (7 items fading in sequentially)

### Input Area
- Warm white background with map-texture
- Decorative compass corner marks (desktop)
- Image upload button (camera icon)
- Textarea: "Describe your destination..." placeholder
- Send button: Compass-colored wax seal when active, muted when disabled
- File attachment preview with gold border
- Keyboard shortcuts footer: Enter, Shift+Enter, Cmd+K, Cmd+E

### Toast Notifications
- Fixed position (top-right on desktop, full-width on mobile)
- Color-coded: success (terrain), error (compass), info (ocean)
- Icon + message + close button
- Auto-dismiss after 3 seconds

### Session Statistics Panel
- Expandable panel below header
- 4-column grid: Queries, Indices, Components, Screenshots
- Color-coded numbers: compass, ocean, terrain, gold

---

## Responsive Behavior (Implemented)

### Desktop (>1024px)
- Full decorative corner marks
- "Algolia Agent Studio" badge visible
- Expanded button labels (Session Map, Export, New Route)
- Side-by-side keyboard shortcuts

### Tablet / Medium (640-1024px)
- Abbreviated button labels
- Hidden some keyboard shortcuts
- Smaller logo and heading

### Mobile (<640px)
- Compact header with minimal buttons
- `100dvh` height for proper mobile viewport
- Safe area padding (notch-aware)
- Smaller prompt cards (single column on very small screens)
- Touch-friendly 44px minimum target sizes
- Compact code blocks with smaller fonts

---

## Accessibility Specifications

### Keyboard Navigation
- `Enter`: Send message
- `Shift+Enter`: New line in input
- `Cmd/Ctrl+K`: New conversation
- `Cmd/Ctrl+E`: Export conversation
- `Cmd/Ctrl+/`: Toggle session statistics

### ARIA Support
- File input: `aria-label="Upload screenshot for AI analysis"`
- Scroll-to-bottom button: `aria-label="Scroll to bottom"`
- Code block actions: Individual `aria-label` attributes
- Toast notifications: Auto-announced

### Motion
- All animations use CSS (respect `prefers-reduced-motion`)
- Loading indicators provide text alternatives

---

**Last Updated**: February 2026
