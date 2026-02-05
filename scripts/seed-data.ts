
import fs from 'fs';
import path from 'path';

// Helper to write JSON files
const writeData = (filename: string, data: unknown) => {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    fs.writeFileSync(path.join(dir, filename), JSON.stringify(data, null, 2));
    console.log(`Generated ${path.join(dir, filename)}`);
};

// 1. Components Data
const components = [
    {
        objectID: "button",
        name: "Button",
        displayName: "Button Component",
        category: "Actions",
        description: "A flexible button component supporting multiple variants",
        variants: ["primary", "secondary", "destructive", "ghost"],
        props: [
            {
                name: "variant",
                type: "'primary' | 'secondary' | 'destructive' | 'ghost'",
                required: false,
                defaultValue: "primary",
                description: "The visual style of the button"
            },
            {
                name: "size",
                type: "'sm' | 'md' | 'lg'",
                required: false,
                defaultValue: "md",
                description: "The size of the button"
            }
        ],
        storybookUrl: "https://storybook.flolabs.com/?path=/docs/button",
        accessibilityNotes: "Use semantic <button> element. Include aria-label for icon-only buttons.",
        status: "stable",
        tags: ["interactive", "action", "form"],
        keywords: ["button", "cta", "submit", "click"],
        createdAt: "2024-01-15T00:00:00Z",
        updatedAt: "2025-12-01T00:00:00Z"
    },
    {
        objectID: "input",
        name: "Input",
        displayName: "Input Component",
        category: "Forms",
        description: "Text input field with label and error states",
        variants: ["text", "email", "password", "search"],
        props: [
            {
                name: "type",
                type: "'text' | 'email' | 'password' | 'search'",
                required: false,
                defaultValue: "text",
                description: "Input type"
            },
            {
                name: "label",
                type: "string",
                required: true,
                description: "Label text for the input"
            }
        ],
        accessibilityNotes: "Always provide a visible label. Use aria-describedby for error messages.",
        status: "stable",
        tags: ["form", "input", "text"],
        keywords: ["input", "form", "field", "textbox"],
        createdAt: "2024-02-01T00:00:00Z",
        updatedAt: "2025-11-15T00:00:00Z"
    },
    {
        objectID: "card",
        name: "Card",
        displayName: "Card Component",
        category: "Layout",
        description: "Container component for grouping related content",
        variants: ["default", "hover", "bordered"],
        props: [
            {
                name: "padding",
                type: "'none' | 'sm' | 'md' | 'lg'",
                required: false,
                defaultValue: "md",
                description: "Padding inside the card"
            }
        ],
        accessibilityNotes: "Cards are generally static containers. If they are interactive, ensure the whole card is a click target or use proper focus management.",
        status: "stable",
        tags: ["layout", "container", "box"],
        keywords: ["card", "panel", "box", "container"],
        createdAt: "2024-03-01T00:00:00Z",
        updatedAt: "2025-10-20T00:00:00Z"
    }
];

// 2. Code Implementations
const codeImplementations = [
    {
        objectID: "button-impl-1",
        componentId: "button",
        language: "tsx",
        content: `
import { Button } from '@flolabs/ui';

export const SubmitButton = () => (
  <Button 
    variant="primary" 
    onClick={() => handleSubmit()}
    aria-label="Submit form"
  >
    Submit Application
  </Button>
);
`,
        context: "Usage in RegistrationForm.tsx",
        sourceUrl: "https://github.com/flolabs/web/blob/main/src/forms/RegistrationForm.tsx"
    },
    {
        objectID: "input-impl-1",
        componentId: "input",
        language: "tsx",
        content: `
import { Input } from '@flolabs/ui';

export const EmailField = () => (
  <Input
    type="email"
    label="Email Address"
    placeholder="you@company.com"
    required
    error={errors.email}
  />
);
`,
        context: "Usage in LoginForm.tsx",
        sourceUrl: "https://github.com/flolabs/web/blob/main/src/auth/LoginForm.tsx"
    }
];

// Write files
writeData('components_index.json', components);
writeData('code_implementations_index.json', codeImplementations);

console.log('Seeding complete! You can now upload these files to Algolia.');
