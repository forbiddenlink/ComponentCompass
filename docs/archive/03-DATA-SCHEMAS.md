# Trace - Data Schemas

## Overview
This document defines the structure of all 7 Algolia indices that power Trace.

---

## Index 1: components_index

**Purpose**: Store component metadata, props, variants, and documentation.

### Schema
```typescript
interface ComponentRecord {
  // Algolia ObjectID
  objectID: string; // "button-primary"
  
  // Basic Info
  name: string; // "Button"
  displayName: string; // "Button Component"
  category: string; // "Actions" | "Navigation" | "Inputs" | "Display"
  description: string; // "A button component for user actions"
  
  // Component Details
  variants: string[]; // ["primary", "secondary", "destructive"]
  props: PropDefinition[]; // See PropDefinition below
  defaultProps: Record<string, any>;
  
  // Documentation
  storybookUrl: string; // "https://storybook.com/button"
  figmaUrl?: string; // "https://figma.com/file/..."
  docsUrl?: string; // "https://docs.com/button"
  
  // Usage
  useCases: string[]; // ["Call to action", "Form submission", "Navigation"]
  examples: CodeExample[]; // See CodeExample below
  
  // Accessibility
  accessibilityNotes: string;
  ariaAttributes: string[]; // ["aria-label", "aria-pressed"]
  keyboardSupport: string[]; // ["Enter", "Space"]
  
  // Status
  status: "stable" | "beta" | "deprecated";
  deprecationNote?: string;
  version: string; // "2.1.0"
  
  // Metadata for search
  tags: string[]; // ["interactive", "form", "cta"]
  keywords: string[]; // ["submit", "click", "action"]
  
  // Timestamps
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

interface PropDefinition {
  name: string; // "variant"
  type: string; // "primary" | "secondary" | "destructive"
  required: boolean;
  defaultValue?: any;
  description: string;
}

interface CodeExample {
  title: string; // "Primary Button"
  code: string; // React code
  description: string;
}
```

### Sample Record
```json
{
  "objectID": "button",
  "name": "Button",
  "displayName": "Button Component",
  "category": "Actions",
  "description": "A flexible button component supporting multiple variants and states",
  "variants": ["primary", "secondary", "destructive", "ghost"],
  "props": [
    {
      "name": "variant",
      "type": "'primary' | 'secondary' | 'destructive' | 'ghost'",
      "required": false,
      "defaultValue": "primary",
      "description": "The visual style of the button"
    },
    {
      "name": "size",
      "type": "'sm' | 'md' | 'lg'",
      "required": false,
      "defaultValue": "md",
      "description": "The size of the button"
    },
    {
      "name": "isLoading",
      "type": "boolean",
      "required": false,
      "defaultValue": false,
      "description": "Shows loading spinner"
    }
  ],
  "storybookUrl": "https://storybook.flolabs.com/?path=/docs/actions-button",
  "figmaUrl": "https://figma.com/file/xyz/Design-System?node-id=123",
  "useCases": [
    "Primary call to action",
    "Form submission", 
    "Destructive actions like delete"
  ],
  "examples": [
    {
      "title": "Primary CTA Button",
      "code": "<Button variant=\"primary\" size=\"lg\">Get Started</Button>",
      "description": "Use for the main call to action on a page"
    }
  ],
  "accessibilityNotes": "Ensure button text clearly describes the action. Use aria-label for icon-only buttons.",
  "ariaAttributes": ["aria-label", "aria-pressed", "aria-expanded"],
  "keyboardSupport": ["Enter", "Space"],
  "status": "stable",
  "version": "2.1.0",
  "tags": ["interactive", "action", "form"],
  "keywords": ["button", "cta", "submit", "click", "action"],
  "createdAt": "2024-01-15T00:00:00Z",
  "updatedAt": "2025-12-01T00:00:00Z"
}
```

### Searchable Attributes Configuration
```javascript
{
  searchableAttributes: [
    'name',
    'displayName',
    'description',
    'keywords',
    'tags',
    'useCases',
    'category'
  ],
  attributesForFaceting: [
    'category',
    'status',
    'tags',
    'variants'
  ]
}
```

---

## Index 2: code_implementations_index

**Purpose**: Store real code examples from production repositories.

### Schema
```typescript
interface CodeImplementationRecord {
  objectID: string; // "button-robocollective-header-123"
  
  // Component Reference
  componentName: string; // "Button"
  componentVariant?: string; // "primary"
  
  // Source Info
  repository: string; // "flo-labs/robocollective"
  filePath: string; // "src/components/Header/Header.tsx"
  githubUrl: string; // Full GitHub URL to line
  lineNumber: number;
  
  // Code
  codeSnippet: string; // The actual usage code
  language: string; // "typescript" | "javascript"
  
  // Context
  parentComponent: string; // "Header"
  description: string; // "Primary CTA button in navigation"
  propsUsed: Record<string, any>; // { variant: "primary", size: "md" }
  
  // Site/Project
  projectName: string; // "robocollective.ai"
  projectUrl: string; // "https://robocollective.ai"
  
  // Metadata
  addedDate: string; // When it was first added to codebase
  lastModified: string; // Last time it was changed
  author: string; // Who wrote it
  
  // Usage Stats
  isProduction: boolean; // Is this live in production?
  pageUrl?: string; // Where this appears on the site
}
```

### Sample Record
```json
{
  "objectID": "button-robocollective-nav-cta",
  "componentName": "Button",
  "componentVariant": "primary",
  "repository": "flo-labs/robocollective",
  "filePath": "src/components/Navigation/NavBar.tsx",
  "githubUrl": "https://github.com/flo-labs/robocollective/blob/main/src/components/Navigation/NavBar.tsx#L45",
  "lineNumber": 45,
  "codeSnippet": "<Button\n  variant=\"primary\"\n  size=\"lg\"\n  onClick={handleGetStarted}\n  aria-label=\"Get started with AI robots\"\n>\n  Get Started\n</Button>",
  "language": "typescript",
  "parentComponent": "NavBar",
  "description": "Main CTA in navigation for getting started",
  "propsUsed": {
    "variant": "primary",
    "size": "lg",
    "onClick": "handleGetStarted"
  },
  "projectName": "robocollective.ai",
  "projectUrl": "https://robocollective.ai",
  "addedDate": "2024-06-15T00:00:00Z",
  "lastModified": "2025-01-02T00:00:00Z",
  "author": "liz@flolabs.com",
  "isProduction": true,
  "pageUrl": "https://robocollective.ai"
}
```

---

## Index 3: design_files_index

**Purpose**: Figma component metadata and design specifications.

### Schema
```typescript
interface DesignFileRecord {
  objectID: string; // "figma-button-primary"
  
  // Figma Info
  figmaFileKey: string;
  figmaNodeId: string;
  figmaUrl: string; // Full URL to component
  
  // Component Info
  componentName: string; // "Button"
  componentVariant?: string; // "Primary"
  
  // Visual
  thumbnailUrl: string; // Preview image URL
  width: number; // In pixels
  height: number; // In pixels
  
  // Design Specs
  colorStyles: DesignToken[]; // Colors used
  textStyles: DesignToken[]; // Typography used
  effectStyles: DesignToken[]; // Shadows, etc.
  spacing: Record<string, string>; // Padding, margins
  
  // Design System Info
  category: string; // "Actions"
  status: "ready" | "wip" | "deprecated";
  
  // Metadata
  designer: string; // Who created it
  lastUpdated: string; // Last modified in Figma
  
  // Sync Status
  hasCodeImplementation: boolean; // Is this implemented in code?
  codeComponentId?: string; // Link to component_index record
}

interface DesignToken {
  name: string; // "primary-500"
  value: string; // "#3B82F6"
  type: "color" | "typography" | "spacing" | "effect";
}
```

### Sample Record
```json
{
  "objectID": "figma-button-primary",
  "figmaFileKey": "abc123xyz",
  "figmaNodeId": "456:789",
  "figmaUrl": "https://figma.com/file/abc123xyz/Design-System?node-id=456:789",
  "componentName": "Button",
  "componentVariant": "Primary",
  "thumbnailUrl": "https://figma.com/thumbnails/...",
  "width": 120,
  "height": 44,
  "colorStyles": [
    {
      "name": "primary-500",
      "value": "#3B82F6",
      "type": "color"
    },
    {
      "name": "white",
      "value": "#FFFFFF",
      "type": "color"
    }
  ],
  "textStyles": [
    {
      "name": "button-text",
      "value": "16px/24px Inter",
      "type": "typography"
    }
  ],
  "spacing": {
    "paddingX": "16px",
    "paddingY": "12px"
  },
  "category": "Actions",
  "status": "ready",
  "designer": "design@flolabs.com",
  "lastUpdated": "2025-11-15T00:00:00Z",
  "hasCodeImplementation": true,
  "codeComponentId": "button"
}
```

---

## Index 4: accessibility_index

**Purpose**: WCAG guidelines, ARIA patterns, and team accessibility standards.

### Schema
```typescript
interface AccessibilityRecord {
  objectID: string; // "aria-button-pattern"
  
  // Classification
  type: "wcag_guideline" | "aria_pattern" | "team_standard" | "keyboard_pattern";
  category: string; // "Interactive" | "Forms" | "Navigation"
  
  // Content
  title: string; // "Button Accessibility Pattern"
  description: string; // Explanation
  
  // Guidelines
  guidelines: Guideline[];
  
  // Code Examples
  goodExample: string; // Correct implementation
  badExample?: string; // Common mistakes
  
  // Requirements
  requiredAttributes: string[]; // ["role", "aria-label"]
  keyboardSupport: KeyboardRequirement[];
  
  // WCAG Compliance
  wcagLevel: "A" | "AA" | "AAA";
  wcagCriteria: string[]; // ["2.1.1", "4.1.2"]
  
  // Related Components
  appliesTo: string[]; // ["Button", "IconButton"]
  
  // Resources
  resources: Resource[];
}

interface Guideline {
  rule: string;
  explanation: string;
  severity: "must" | "should" | "recommended";
}

interface KeyboardRequirement {
  key: string; // "Enter"
  action: string; // "Activates button"
}

interface Resource {
  title: string;
  url: string;
  type: "wcag" | "mdn" | "aria" | "internal";
}
```

### Sample Record
```json
{
  "objectID": "aria-button-pattern",
  "type": "aria_pattern",
  "category": "Interactive",
  "title": "Button Accessibility Pattern",
  "description": "Guidelines for making button components accessible to all users",
  "guidelines": [
    {
      "rule": "Use semantic <button> element",
      "explanation": "Provides built-in keyboard support and role",
      "severity": "must"
    },
    {
      "rule": "Provide accessible name",
      "explanation": "Button text or aria-label must describe action",
      "severity": "must"
    },
    {
      "rule": "Maintain 3:1 contrast ratio",
      "explanation": "Ensure button is visually distinguishable",
      "severity": "must"
    }
  ],
  "goodExample": "<button type=\"button\" aria-label=\"Close dialog\">\n  <CloseIcon />\n</button>",
  "badExample": "<div onClick={handleClick}>\n  <CloseIcon />\n</div>",
  "requiredAttributes": ["type", "aria-label (if icon-only)"],
  "keyboardSupport": [
    {
      "key": "Enter",
      "action": "Activates button"
    },
    {
      "key": "Space",
      "action": "Activates button"
    }
  ],
  "wcagLevel": "A",
  "wcagCriteria": ["2.1.1", "4.1.2"],
  "appliesTo": ["Button", "IconButton", "ToggleButton"],
  "resources": [
    {
      "title": "ARIA: button role",
      "url": "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role",
      "type": "mdn"
    }
  ]
}
```

---

## Index 5: design_tokens_index

**Purpose**: Design tokens (colors, spacing, typography, etc.).

### Schema
```typescript
interface DesignTokenRecord {
  objectID: string; // "color-primary-500"
  
  // Token Info
  tokenName: string; // "primary-500"
  displayName: string; // "Primary Blue 500"
  category: "color" | "spacing" | "typography" | "shadow" | "border" | "duration";
  
  // Value
  value: string; // "#3B82F6" or "16px" or "0.3s"
  cssVariable: string; // "--color-primary-500"
  
  // Usage
  description: string; // "Primary brand color for CTAs"
  usageGuidelines: string[]; // When to use this token
  
  // Relationships
  relatedTokens: string[]; // ["primary-400", "primary-600"]
  parentToken?: string; // For hierarchical tokens
  
  // Accessibility
  contrastRatios?: Record<string, number>; // For colors
  
  // Examples
  examplesUsage: string[]; // Where it's used
}
```

### Sample Record
```json
{
  "objectID": "color-primary-500",
  "tokenName": "primary-500",
  "displayName": "Primary Blue 500",
  "category": "color",
  "value": "#3B82F6",
  "cssVariable": "--color-primary-500",
  "description": "Primary brand color used for CTAs and important interactive elements",
  "usageGuidelines": [
    "Use for primary call-to-action buttons",
    "Use for focused states on inputs",
    "Use for important links"
  ],
  "relatedTokens": ["primary-400", "primary-600"],
  "contrastRatios": {
    "white": 4.5,
    "black": 8.2
  },
  "examplesUsage": [
    "Button primary variant",
    "Link default color",
    "Input focus ring"
  ]
}
```

---

## Index 6: usage_analytics_index

**Purpose**: Track where and how components are used in production.

### Schema
```typescript
interface UsageAnalyticsRecord {
  objectID: string; // "button-usage-robocollective"
  
  // Component
  componentName: string; // "Button"
  componentVariant?: string; // "primary"
  
  // Usage Location
  projectName: string; // "robocollective.ai"
  pagePath: string; // "/pricing"
  pageTitle: string; // "Pricing Page"
  
  // Usage Count
  instanceCount: number; // How many times on this page
  
  // Props Analysis
  commonProps: PropUsage[]; // Most used prop combinations
  
  // Context
  context: string; // "Used 3 times: header CTA, pricing section CTA, footer CTA"
  
  // Metadata
  lastScanned: string; // When we last checked this page
}

interface PropUsage {
  props: Record<string, any>;
  count: number; // How many times this combination appears
}
```

### Sample Record
```json
{
  "objectID": "button-usage-robocollective-home",
  "componentName": "Button",
  "componentVariant": "primary",
  "projectName": "robocollective.ai",
  "pagePath": "/",
  "pageTitle": "Home",
  "instanceCount": 3,
  "commonProps": [
    {
      "props": { "variant": "primary", "size": "lg" },
      "count": 2
    },
    {
      "props": { "variant": "primary", "size": "md" },
      "count": 1
    }
  ],
  "context": "Header CTA (2x), Hero section CTA (1x)",
  "lastScanned": "2026-01-12T00:00:00Z"
}
```

---

## Index 7: team_knowledge_index

**Purpose**: Architecture Decision Records, team patterns, design decisions.

### Schema
```typescript
interface TeamKnowledgeRecord {
  objectID: string; // "adr-001-button-variants"
  
  // Classification
  type: "adr" | "pattern" | "decision" | "discussion";
  
  // Content
  title: string; // "Why we use ButtonPrimary for CTAs"
  summary: string; // Brief summary
  content: string; // Full content (markdown)
  
  // Decision Info (if ADR)
  status?: "proposed" | "accepted" | "deprecated";
  decisionDate?: string;
  decidedBy?: string[]; // Team members involved
  
  // Context
  relatedComponents: string[]; // ["Button"]
  tags: string[]; // ["buttons", "design-system", "patterns"]
  
  // Source
  sourceType: "slack" | "github" | "confluence" | "notion";
  sourceUrl?: string; // Link to original
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

### Sample Record
```json
{
  "objectID": "adr-001-button-variants",
  "type": "adr",
  "title": "Button Variant Naming and Usage",
  "summary": "Established naming convention for button variants and when to use each",
  "content": "# Context\nWe needed clear guidelines for when to use each button variant...\n\n# Decision\nWe will use 'primary' for main CTAs, 'secondary' for alternative actions...",
  "status": "accepted",
  "decisionDate": "2024-03-15T00:00:00Z",
  "decidedBy": ["liz@flolabs.com", "design@flolabs.com"],
  "relatedComponents": ["Button"],
  "tags": ["buttons", "naming", "conventions"],
  "sourceType": "github",
  "sourceUrl": "https://github.com/flo-labs/design-system/docs/adr/001-button-variants.md",
  "createdAt": "2024-03-15T00:00:00Z",
  "updatedAt": "2024-03-15T00:00:00Z"
}
```

---

## Data Collection Scripts

### Script Outline

```bash
# 1. Extract component metadata from Storybook
npm run extract-components

# 2. Parse code implementations from GitHub repos
npm run parse-implementations

# 3. Pull Figma components via API
npm run sync-figma

# 4. Compile accessibility guidelines
npm run compile-accessibility

# 5. Extract design tokens
npm run extract-tokens

# 6. Analyze production usage
npm run analyze-usage

# 7. Index team knowledge
npm run index-knowledge
```

---

**Next**: Agent Studio prompts and conversation flows
