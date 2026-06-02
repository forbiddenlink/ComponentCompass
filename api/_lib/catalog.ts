/* Auto-generated from data/components_index_enhanced.json. Do not edit by hand.
 * Inlined as a TS module so the Vercel serverless function bundles it reliably
 * (importing JSON from outside api/ caused ERR_MODULE_NOT_FOUND in production). */
export interface CatalogComponent {
  objectID: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  status: string;
  props: string;
  variants: string;
}

const catalog: CatalogComponent[] = [
  {
    "objectID": "button-1",
    "name": "Button",
    "category": "Forms",
    "description": "Clickable button with variants: default, destructive, outline, secondary, ghost, link. Sizes: default, sm, lg, icon.",
    "tags": [
      "interactive",
      "form",
      "action",
      "cta"
    ],
    "status": "stable",
    "props": "variant, size, asChild, disabled",
    "variants": "default, destructive, outline, secondary, ghost, link"
  },
  {
    "objectID": "input-1",
    "name": "Input",
    "category": "Forms",
    "description": "Text input field. Types: text, email, password, number, tel, url, search.",
    "tags": [
      "form",
      "text",
      "input",
      "field"
    ],
    "status": "stable",
    "props": "type, placeholder, disabled, value",
    "variants": "default, error"
  },
  {
    "objectID": "card-1",
    "name": "Card",
    "category": "Layout",
    "description": "Container with header, content, footer. Sub: CardHeader, CardTitle, CardDescription, CardContent, CardFooter.",
    "tags": [
      "container",
      "layout",
      "content"
    ],
    "status": "stable",
    "props": "className",
    "variants": "default"
  },
  {
    "objectID": "dialog-1",
    "name": "Dialog",
    "category": "Overlay",
    "description": "Modal with focus trapping, keyboard nav. Sub: DialogTrigger, DialogContent, DialogTitle, DialogFooter.",
    "tags": [
      "modal",
      "overlay",
      "popup"
    ],
    "status": "stable",
    "props": "open, onOpenChange",
    "variants": "default"
  },
  {
    "objectID": "select-1",
    "name": "Select",
    "category": "Forms",
    "description": "Dropdown picker. Sub: SelectTrigger, SelectValue, SelectContent, SelectItem.",
    "tags": [
      "dropdown",
      "picker",
      "select"
    ],
    "status": "stable",
    "props": "value, onValueChange, disabled",
    "variants": "default"
  },
  {
    "objectID": "checkbox-1",
    "name": "Checkbox",
    "category": "Forms",
    "description": "Toggle for checked/unchecked/indeterminate states. Built with Radix UI.",
    "tags": [
      "form",
      "toggle",
      "boolean"
    ],
    "status": "stable",
    "props": "checked, onCheckedChange, disabled",
    "variants": "default"
  },
  {
    "objectID": "badge-1",
    "name": "Badge",
    "category": "Data Display",
    "description": "Small label for status, tags, counts. Variants: default, secondary, destructive, outline.",
    "tags": [
      "label",
      "tag",
      "status"
    ],
    "status": "stable",
    "props": "variant",
    "variants": "default, secondary, destructive, outline"
  }
];

export default catalog;
