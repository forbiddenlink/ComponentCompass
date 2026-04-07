/**
 * Component templates for Sandpack live preview
 */

export interface ComponentTemplate {
    code: string;
    description?: string;
    dependencies?: Record<string, string>;
    files?: Record<string, string>;
}

// Utility file for all templates
export const UTILS_FILE = `// Utility functions for styling
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
`;

// Shared styles object
export const SHARED_STYLES = {
    bg: '#F9F6F0',
    bgWarm: '#FFFAF3',
    ink: '#2C3E50',
    muted: '#7A8B8C',
    compass: '#C84B31',
    compassDark: '#A63D2A',
    ocean: '#1A535C',
    terrain: '#4E6E58',
    gold: '#D4AF37',
};

// Component Templates
export const COMPONENT_TEMPLATES: Record<string, ComponentTemplate> = {
    button: {
        description: 'Interactive button with multiple variants and sizes',
        code: `import { useState } from 'react';

function Button({ variant = 'default', size = 'default', children, ...props }) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const variants = {
    default: "bg-[#C84B31] text-white hover:bg-[#A63D2A] focus-visible:ring-[#C84B31]",
    destructive: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500",
    outline: "border border-gray-300 bg-white hover:bg-gray-100 text-gray-900",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "hover:bg-gray-100 text-gray-700",
    link: "text-[#C84B31] underline-offset-4 hover:underline"
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8 text-lg",
    icon: "h-10 w-10"
  };

  return (
    <button
      className={\`\${baseStyles} \${variants[variant]} \${sizes[size]}\`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-8 space-y-6 bg-[#F9F6F0] min-h-screen">
      <h2 className="text-2xl font-semibold text-[#2C3E50]">Button Variants</h2>

      <div className="flex flex-wrap gap-3">
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>

      <h2 className="text-2xl font-semibold text-[#2C3E50] mt-8">Button Sizes</h2>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">+</Button>
      </div>

      <h2 className="text-2xl font-semibold text-[#2C3E50] mt-8">Interactive Demo</h2>

      <div className="flex items-center gap-4">
        <Button onClick={() => setCount(c => c - 1)}>-</Button>
        <span className="text-xl font-mono text-[#2C3E50] min-w-[3ch] text-center">{count}</span>
        <Button onClick={() => setCount(c => c + 1)}>+</Button>
      </div>
    </div>
  );
}`,
    },

    input: {
        description: 'Text input with validation states',
        code: `import { useState } from 'react';

function Input({ type = 'text', error, ...props }) {
  const baseStyles = "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31] disabled:cursor-not-allowed disabled:opacity-50";
  const errorStyles = error ? "border-red-500 focus-visible:ring-red-500" : "border-gray-300";

  return (
    <input
      type={type}
      className={\`\${baseStyles} \${errorStyles}\`}
      {...props}
    />
  );
}

function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-[#2C3E50]">
      {children}
    </label>
  );
}

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="p-8 space-y-6 bg-[#F9F6F0] min-h-screen">
      <h2 className="text-2xl font-semibold text-[#2C3E50]">Input Types</h2>

      <div className="space-y-4 max-w-sm">
        <div className="space-y-2">
          <Label htmlFor="text">Text</Label>
          <Input id="text" placeholder="Enter text..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="disabled">Disabled</Label>
          <Input id="disabled" disabled placeholder="Can't edit this" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="error">With Error</Label>
          <Input id="error" error placeholder="Something went wrong" />
          <p className="text-sm text-red-500">This field has an error</p>
        </div>
      </div>
    </div>
  );
}`,
    },

    card: {
        description: 'Card container with header, content, and footer',
        code: `function Card({ className, children }) {
  return (
    <div className={\`rounded-lg border bg-white shadow-sm \${className || ''}\`}>
      {children}
    </div>
  );
}

function CardHeader({ children }) {
  return <div className="flex flex-col space-y-1.5 p-6">{children}</div>;
}

function CardTitle({ children }) {
  return <h3 className="text-2xl font-semibold text-[#2C3E50]">{children}</h3>;
}

function CardDescription({ children }) {
  return <p className="text-sm text-[#7A8B8C]">{children}</p>;
}

function CardContent({ children }) {
  return <div className="p-6 pt-0">{children}</div>;
}

function CardFooter({ children }) {
  return <div className="flex items-center p-6 pt-0">{children}</div>;
}

export default function App() {
  return (
    <div className="p-8 space-y-6 bg-[#F9F6F0] min-h-screen">
      <h2 className="text-2xl font-semibold text-[#2C3E50]">Card Component</h2>

      <div className="grid gap-6 md:grid-cols-2 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[#2C3E50]">This is the card content area where you can place any content.</p>
          </CardContent>
          <CardFooter>
            <button className="px-4 py-2 bg-[#C84B31] text-white rounded-md hover:bg-[#A63D2A] transition-colors">
              Action
            </button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Card</CardTitle>
            <CardDescription>With icon and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#C84B31]/10 flex items-center justify-center text-[#C84B31] text-xl">
                *
              </div>
              <div>
                <p className="text-3xl font-bold text-[#2C3E50]">1,234</p>
                <p className="text-sm text-[#7A8B8C]">Total items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}`,
    },

    badge: {
        description: 'Status badge with multiple variants',
        code: `function Badge({ variant = 'default', children }) {
  const variants = {
    default: "bg-[#C84B31] text-white",
    secondary: "bg-gray-100 text-gray-900",
    destructive: "bg-red-500 text-white",
    outline: "border border-gray-300 text-gray-700 bg-transparent",
    success: "bg-[#4E6E58] text-white",
    warning: "bg-[#D4AF37] text-white"
  };

  return (
    <span className={\`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors \${variants[variant]}\`}>
      {children}
    </span>
  );
}

export default function App() {
  return (
    <div className="p-8 space-y-6 bg-[#F9F6F0] min-h-screen">
      <h2 className="text-2xl font-semibold text-[#2C3E50]">Badge Variants</h2>

      <div className="flex flex-wrap gap-3">
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
      </div>

      <h2 className="text-2xl font-semibold text-[#2C3E50] mt-8">Use Cases</h2>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-[#2C3E50]">Component Status:</span>
          <Badge variant="success">Stable</Badge>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#2C3E50]">Version:</span>
          <Badge variant="secondary">v2.1.0</Badge>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#2C3E50]">Breaking Change:</span>
          <Badge variant="destructive">Deprecated</Badge>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#2C3E50]">Tags:</span>
          <Badge variant="outline">React</Badge>
          <Badge variant="outline">TypeScript</Badge>
          <Badge variant="outline">Tailwind</Badge>
        </div>
      </div>
    </div>
  );
}`,
    },

    checkbox: {
        description: 'Checkbox with label and group support',
        code: `import { useState } from 'react';

function Checkbox({ checked, onCheckedChange, id, disabled }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      id={id}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={\`
        h-4 w-4 shrink-0 rounded border transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]
        \${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        \${checked
          ? 'bg-[#C84B31] border-[#C84B31] text-white'
          : 'border-gray-300 bg-white'
        }
      \`}
    >
      {checked && (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-[#2C3E50] cursor-pointer select-none">
      {children}
    </label>
  );
}

export default function App() {
  const [terms, setTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [items, setItems] = useState({ design: true, dev: false, marketing: false });

  const allChecked = Object.values(items).every(Boolean);

  return (
    <div className="p-8 space-y-8 bg-[#F9F6F0] min-h-screen">
      <h2 className="text-2xl font-semibold text-[#2C3E50]">Checkbox States</h2>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Checkbox id="terms" checked={terms} onCheckedChange={setTerms} />
          <Label htmlFor="terms">Accept terms and conditions</Label>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox id="newsletter" checked={newsletter} onCheckedChange={setNewsletter} />
          <Label htmlFor="newsletter">Subscribe to newsletter</Label>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox id="disabled" checked={false} disabled />
          <Label htmlFor="disabled">Disabled checkbox</Label>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-[#2C3E50]">Checkbox Group</h2>

      <div className="space-y-3">
        <div className="flex items-center gap-3 pb-2 border-b">
          <Checkbox
            id="all"
            checked={allChecked}
            onCheckedChange={(checked) => setItems({ design: checked, dev: checked, marketing: checked })}
          />
          <Label htmlFor="all">Select all departments</Label>
        </div>

        {Object.entries(items).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3 ml-4">
            <Checkbox
              id={key}
              checked={value}
              onCheckedChange={(checked) => setItems(prev => ({ ...prev, [key]: checked }))}
            />
            <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    },

    select: {
        description: 'Dropdown select with options',
        code: `import { useState } from 'react';

function Select({ value, onValueChange, placeholder, options, disabled }) {
  const [open, setOpen] = useState(false);

  const selected = options.find(o => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={\`
          flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm
          transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]
          \${disabled ? 'cursor-not-allowed opacity-50 bg-gray-100' : 'bg-white cursor-pointer'}
          \${open ? 'border-[#C84B31]' : 'border-gray-300'}
        \`}
      >
        <span className={selected ? 'text-[#2C3E50]' : 'text-[#7A8B8C]'}>
          {selected?.label || placeholder}
        </span>
        <svg className={\`h-4 w-4 opacity-50 transition-transform \${open ? 'rotate-180' : ''}\`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
          <div className="p-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => { onValueChange(option.value); setOpen(false); }}
                className={\`
                  flex w-full items-center rounded-sm px-2 py-1.5 text-sm cursor-pointer
                  \${value === option.value ? 'bg-[#C84B31]/10 text-[#C84B31]' : 'text-[#2C3E50] hover:bg-gray-100'}
                \`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [framework, setFramework] = useState('');
  const [theme, setTheme] = useState('light');

  const frameworks = [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
    { value: 'svelte', label: 'Svelte' },
  ];

  const themes = [
    { value: 'light', label: 'Light Mode' },
    { value: 'dark', label: 'Dark Mode' },
    { value: 'system', label: 'System' },
  ];

  return (
    <div className="p-8 space-y-6 bg-[#F9F6F0] min-h-screen">
      <h2 className="text-2xl font-semibold text-[#2C3E50]">Select Component</h2>

      <div className="space-y-6 max-w-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2C3E50]">Framework</label>
          <Select
            value={framework}
            onValueChange={setFramework}
            placeholder="Select a framework..."
            options={frameworks}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2C3E50]">Theme</label>
          <Select
            value={theme}
            onValueChange={setTheme}
            placeholder="Select theme..."
            options={themes}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2C3E50]">Disabled</label>
          <Select
            value=""
            onValueChange={() => {}}
            placeholder="Can't select this"
            options={[]}
            disabled
          />
        </div>

        {framework && (
          <p className="text-sm text-[#4E6E58] bg-[#4E6E58]/10 px-3 py-2 rounded-md">
            Selected: <strong>{framework}</strong>
          </p>
        )}
      </div>
    </div>
  );
}`,
    },

    dialog: {
        description: 'Modal dialog with overlay',
        code: `import { useState } from 'react';

function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
        <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function DialogHeader({ children }) {
  return <div className="space-y-1.5 mb-4">{children}</div>;
}

function DialogTitle({ children }) {
  return <h2 className="text-lg font-semibold text-[#2C3E50]">{children}</h2>;
}

function DialogDescription({ children }) {
  return <p className="text-sm text-[#7A8B8C]">{children}</p>;
}

function DialogFooter({ children }) {
  return <div className="flex justify-end gap-2 mt-6">{children}</div>;
}

function Button({ variant = 'default', children, ...props }) {
  const variants = {
    default: "bg-[#C84B31] text-white hover:bg-[#A63D2A]",
    outline: "border border-gray-300 bg-white hover:bg-gray-100 text-[#2C3E50]",
  };

  return (
    <button
      className={\`px-4 py-2 rounded-md font-medium transition-colors \${variants[variant]}\`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="p-8 space-y-6 bg-[#F9F6F0] min-h-screen">
      <h2 className="text-2xl font-semibold text-[#2C3E50]">Dialog Component</h2>

      <div className="flex gap-4">
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <Button variant="outline" onClick={() => setConfirmOpen(true)}>
          Confirm Action
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2C3E50]">Name</label>
            <input
              className="w-full h-10 px-3 border rounded-md"
              placeholder="Enter your name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2C3E50]">Email</label>
            <input
              className="w-full h-10 px-3 border rounded-md"
              placeholder="Enter your email"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => setOpen(false)}>Save Changes</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={() => setConfirmOpen(false)}>Delete Account</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}`,
    },

    tabs: {
        description: 'Tabbed interface for organizing content',
        code: `import { useState } from 'react';

function Tabs({ children, defaultValue, className }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className={className} data-value={value}>
      {typeof children === 'function' ? children({ value, setValue }) : children}
    </div>
  );
}

function TabsList({ children, className }) {
  return (
    <div className={\`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 \${className || ''}\`}>
      {children}
    </div>
  );
}

function TabsTrigger({ value, activeValue, onClick, children }) {
  const isActive = value === activeValue;
  return (
    <button
      onClick={() => onClick(value)}
      className={\`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all
        \${isActive
          ? 'bg-white text-[#2C3E50] shadow-sm'
          : 'text-[#7A8B8C] hover:text-[#2C3E50]'
        }
      \`}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, activeValue, children }) {
  if (value !== activeValue) return null;
  return <div className="mt-4">{children}</div>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div className="p-8 space-y-6 bg-[#F9F6F0] min-h-screen">
      <h2 className="text-2xl font-semibold text-[#2C3E50]">Tabs Component</h2>

      <div className="max-w-md">
        <TabsList>
          <TabsTrigger value="account" activeValue={activeTab} onClick={setActiveTab}>
            Account
          </TabsTrigger>
          <TabsTrigger value="password" activeValue={activeTab} onClick={setActiveTab}>
            Password
          </TabsTrigger>
          <TabsTrigger value="settings" activeValue={activeTab} onClick={setActiveTab}>
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" activeValue={activeTab}>
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h3 className="text-lg font-semibold text-[#2C3E50]">Account</h3>
            <p className="text-sm text-[#7A8B8C]">
              Make changes to your account here. Click save when you're done.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2C3E50]">Name</label>
              <input className="w-full h-10 px-3 border rounded-md" defaultValue="John Doe" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="password" activeValue={activeTab}>
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h3 className="text-lg font-semibold text-[#2C3E50]">Password</h3>
            <p className="text-sm text-[#7A8B8C]">
              Change your password here. After saving, you'll be logged out.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2C3E50]">Current password</label>
              <input type="password" className="w-full h-10 px-3 border rounded-md" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" activeValue={activeTab}>
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h3 className="text-lg font-semibold text-[#2C3E50]">Settings</h3>
            <p className="text-sm text-[#7A8B8C]">
              Manage your account settings and preferences.
            </p>
          </div>
        </TabsContent>
      </div>
    </div>
  );
}`,
    },

    avatar: {
        description: 'User avatar with fallback support',
        code: `import { useState } from 'react';

function Avatar({ src, alt, fallback, size = 'default' }) {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    default: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg'
  };

  return (
    <div className={\`relative flex shrink-0 overflow-hidden rounded-full \${sizes[size]}\`}>
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#C84B31] text-white font-medium">
          {fallback}
        </div>
      )}
    </div>
  );
}

function AvatarGroup({ children, max = 4 }) {
  const childArray = Array.isArray(children) ? children : [children];
  const visible = childArray.slice(0, max);
  const remaining = childArray.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((child, i) => (
        <div key={i} className="ring-2 ring-white rounded-full">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="ring-2 ring-white rounded-full h-10 w-10 flex items-center justify-center bg-gray-100 text-sm font-medium text-[#2C3E50]">
          +{remaining}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <div className="p-8 space-y-8 bg-[#F9F6F0] min-h-screen">
      <h2 className="text-2xl font-semibold text-[#2C3E50]">Avatar Sizes</h2>

      <div className="flex items-center gap-4">
        <Avatar size="sm" fallback="SM" />
        <Avatar size="default" fallback="DF" />
        <Avatar size="lg" fallback="LG" />
        <Avatar size="xl" fallback="XL" />
      </div>

      <h2 className="text-2xl font-semibold text-[#2C3E50]">With Images</h2>

      <div className="flex items-center gap-4">
        <Avatar
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
          alt="User"
          fallback="U"
        />
        <Avatar
          src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop"
          alt="User"
          fallback="U"
        />
        <Avatar
          src="broken-image-url"
          alt="Fallback"
          fallback="FB"
        />
      </div>

      <h2 className="text-2xl font-semibold text-[#2C3E50]">Avatar Group</h2>

      <AvatarGroup max={3}>
        <Avatar fallback="A" />
        <Avatar fallback="B" />
        <Avatar fallback="C" />
        <Avatar fallback="D" />
        <Avatar fallback="E" />
      </AvatarGroup>
    </div>
  );
}`,
    },

    toast: {
        description: 'Toast notification with variants',
        code: `import { useState, useEffect } from 'react';

function Toast({ message, type = 'default', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const types = {
    default: 'bg-white border-gray-200 text-[#2C3E50]',
    success: 'bg-[#4E6E58] text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-[#D4AF37] text-white',
    info: 'bg-[#1A535C] text-white'
  };

  const icons = {
    default: null,
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i'
  };

  return (
    <div className={\`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border \${types[type]}\`}>
      {icons[type] && (
        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
          {icons[type]}
        </span>
      )}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="hover:opacity-70 transition-opacity">
        ✕
      </button>
    </div>
  );
}

export default function App() {
  const [toasts, setToasts] = useState([]);

  const addToast = (type) => {
    const messages = {
      default: 'This is a default notification',
      success: 'Operation completed successfully!',
      error: 'Something went wrong. Please try again.',
      warning: 'Please review before continuing.',
      info: 'Here is some helpful information.'
    };

    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message: messages[type] }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="p-8 space-y-6 bg-[#F9F6F0] min-h-screen">
      <h2 className="text-2xl font-semibold text-[#2C3E50]">Toast Notifications</h2>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => addToast('default')}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Default
        </button>
        <button
          onClick={() => addToast('success')}
          className="px-4 py-2 bg-[#4E6E58] text-white rounded-md hover:opacity-90 transition-opacity"
        >
          Success
        </button>
        <button
          onClick={() => addToast('error')}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:opacity-90 transition-opacity"
        >
          Error
        </button>
        <button
          onClick={() => addToast('warning')}
          className="px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:opacity-90 transition-opacity"
        >
          Warning
        </button>
        <button
          onClick={() => addToast('info')}
          className="px-4 py-2 bg-[#1A535C] text-white rounded-md hover:opacity-90 transition-opacity"
        >
          Info
        </button>
      </div>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50 w-80">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}`,
    },

    switch: {
        description: 'Toggle switch for on/off states',
        code: `import { useState } from 'react';

function Switch({ checked, onCheckedChange, disabled, size = 'default' }) {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'h-3 w-3', translate: 'translate-x-4' },
    default: { track: 'w-11 h-6', thumb: 'h-5 w-5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'h-6 w-6', translate: 'translate-x-7' }
  };

  const s = sizes[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={\`
        relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:ring-offset-2
        \${disabled ? 'cursor-not-allowed opacity-50' : ''}
        \${checked ? 'bg-[#C84B31]' : 'bg-gray-200'}
        \${s.track}
      \`}
    >
      <span
        className={\`
          pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform
          \${checked ? s.translate : 'translate-x-0.5'}
          \${s.thumb}
        \`}
      />
    </button>
  );
}

export default function App() {
  const [airplane, setAirplane] = useState(false);
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="p-8 space-y-8 bg-[#F9F6F0] min-h-screen">
      <h2 className="text-2xl font-semibold text-[#2C3E50]">Switch Sizes</h2>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch size="sm" checked={true} onCheckedChange={() => {}} />
          <span className="text-sm text-[#2C3E50]">Small</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch size="default" checked={true} onCheckedChange={() => {}} />
          <span className="text-sm text-[#2C3E50]">Default</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch size="lg" checked={true} onCheckedChange={() => {}} />
          <span className="text-sm text-[#2C3E50]">Large</span>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-[#2C3E50]">Settings Example</h2>

      <div className="max-w-sm bg-white rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[#2C3E50]">Airplane Mode</p>
            <p className="text-sm text-[#7A8B8C]">Disable all wireless connections</p>
          </div>
          <Switch checked={airplane} onCheckedChange={setAirplane} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[#2C3E50]">Wi-Fi</p>
            <p className="text-sm text-[#7A8B8C]">Connect to wireless networks</p>
          </div>
          <Switch checked={wifi} onCheckedChange={setWifi} disabled={airplane} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[#2C3E50]">Bluetooth</p>
            <p className="text-sm text-[#7A8B8C]">Connect to Bluetooth devices</p>
          </div>
          <Switch checked={bluetooth} onCheckedChange={setBluetooth} disabled={airplane} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[#2C3E50]">Notifications</p>
            <p className="text-sm text-[#7A8B8C]">Receive push notifications</p>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>
      </div>
    </div>
  );
}`,
    },

    accordion: {
        description: 'Expandable accordion panels',
        code: `import { useState } from 'react';

function Accordion({ children, type = 'single', defaultValue }) {
  const [openItems, setOpenItems] = useState(
    defaultValue ? [defaultValue] : []
  );

  const toggle = (value) => {
    if (type === 'single') {
      setOpenItems(openItems.includes(value) ? [] : [value]);
    } else {
      setOpenItems(
        openItems.includes(value)
          ? openItems.filter(i => i !== value)
          : [...openItems, value]
      );
    }
  };

  return (
    <div className="space-y-2">
      {Array.isArray(children) ? children.map((child, i) => (
        <AccordionItem
          key={i}
          {...child.props}
          isOpen={openItems.includes(child.props.value)}
          onToggle={() => toggle(child.props.value)}
        />
      )) : children}
    </div>
  );
}

function AccordionItem({ value, title, children, isOpen, onToggle }) {
  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-[#2C3E50]">{title}</span>
        <svg
          className={\`w-4 h-4 text-[#7A8B8C] transition-transform \${isOpen ? 'rotate-180' : ''}\`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-sm text-[#7A8B8C]">
          {children}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <div className="p-8 space-y-8 bg-[#F9F6F0] min-h-screen">
      <h2 className="text-2xl font-semibold text-[#2C3E50]">Single Accordion</h2>

      <div className="max-w-md">
        <Accordion type="single" defaultValue="item-1">
          <AccordionItem value="item-1" title="Is it accessible?">
            Yes. It adheres to the WAI-ARIA design pattern for accordions.
          </AccordionItem>
          <AccordionItem value="item-2" title="Is it styled?">
            Yes. It comes with default styles that match the design system.
          </AccordionItem>
          <AccordionItem value="item-3" title="Is it animated?">
            Yes. It uses CSS transitions for smooth expand/collapse animations.
          </AccordionItem>
        </Accordion>
      </div>

      <h2 className="text-2xl font-semibold text-[#2C3E50]">Multiple Accordion</h2>

      <div className="max-w-md">
        <Accordion type="multiple" defaultValue="faq-1">
          <AccordionItem value="faq-1" title="What payment methods do you accept?">
            We accept all major credit cards, PayPal, and bank transfers.
          </AccordionItem>
          <AccordionItem value="faq-2" title="How long does shipping take?">
            Standard shipping takes 5-7 business days. Express shipping is 2-3 days.
          </AccordionItem>
          <AccordionItem value="faq-3" title="What is your return policy?">
            We offer a 30-day return policy for all unused items in original packaging.
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}`,
    },

    alert: {
        description: 'Alert messages with variants',
        code: `function Alert({ variant = 'default', title, children }) {
  const variants = {
    default: {
      container: 'bg-white border-gray-200 text-[#2C3E50]',
      icon: '💬'
    },
    destructive: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: '⚠️'
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: '✓'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: '!'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'ℹ'
    }
  };

  const v = variants[variant];

  return (
    <div className={\`relative w-full rounded-lg border p-4 \${v.container}\`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{v.icon}</span>
        <div className="flex-1">
          {title && <h5 className="mb-1 font-medium leading-none">{title}</h5>}
          <div className="text-sm opacity-90">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="p-8 space-y-6 bg-[#F9F6F0] min-h-screen">
      <h2 className="text-2xl font-semibold text-[#2C3E50]">Alert Variants</h2>

      <div className="max-w-lg space-y-4">
        <Alert title="Default Alert">
          This is a default alert message. It provides general information.
        </Alert>

        <Alert variant="success" title="Success!">
          Your changes have been saved successfully.
        </Alert>

        <Alert variant="destructive" title="Error">
          There was a problem with your request. Please try again.
        </Alert>

        <Alert variant="warning" title="Warning">
          Your session is about to expire. Save your work.
        </Alert>

        <Alert variant="info" title="Information">
          A new version is available. Refresh to update.
        </Alert>

        <Alert variant="info">
          Alert without a title - just the description text.
        </Alert>
      </div>
    </div>
  );
}`,
    },

    slider: {
        description: 'Range slider input',
        code: `import { useState } from 'react';

function Slider({ value, onValueChange, min = 0, max = 100, step = 1, disabled }) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={\`relative flex w-full touch-none select-none items-center \${disabled ? 'opacity-50' : ''}\`}>
      <div className="relative h-2 w-full rounded-full bg-gray-200">
        <div
          className="absolute h-full rounded-full bg-[#C84B31]"
          style={{ width: \`\${percentage}%\` }}
        />
        <input
          type="range"
          value={value}
          onChange={(e) => onValueChange?.(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute h-5 w-5 rounded-full border-2 border-[#C84B31] bg-white shadow -translate-y-1.5 cursor-pointer"
          style={{ left: \`calc(\${percentage}% - 10px)\` }}
        />
      </div>
    </div>
  );
}

export default function App() {
  const [volume, setVolume] = useState(50);
  const [brightness, setBrightness] = useState(75);
  const [progress, setProgress] = useState(33);

  return (
    <div className="p-8 space-y-8 bg-[#F9F6F0] min-h-screen">
      <h2 className="text-2xl font-semibold text-[#2C3E50]">Slider Component</h2>

      <div className="max-w-md space-y-8">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-[#2C3E50]">Volume</label>
            <span className="text-sm text-[#7A8B8C]">{volume}%</span>
          </div>
          <Slider value={volume} onValueChange={setVolume} />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-[#2C3E50]">Brightness</label>
            <span className="text-sm text-[#7A8B8C]">{brightness}%</span>
          </div>
          <Slider value={brightness} onValueChange={setBrightness} />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-[#2C3E50]">Progress</label>
            <span className="text-sm text-[#7A8B8C]">{progress}%</span>
          </div>
          <Slider value={progress} onValueChange={setProgress} />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-[#2C3E50]">Disabled</label>
          <Slider value={50} onValueChange={() => {}} disabled />
        </div>
      </div>
    </div>
  );
}`,
    },

    progress: {
        description: 'Progress bar indicator',
        code: `import { useState, useEffect } from 'react';

function Progress({ value = 0, max = 100, variant = 'default', showLabel = false, size = 'default' }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variants = {
    default: 'bg-[#C84B31]',
    success: 'bg-[#4E6E58]',
    warning: 'bg-[#D4AF37]',
    info: 'bg-[#1A535C]'
  };

  const sizes = {
    sm: 'h-1',
    default: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className="w-full">
      <div className={\`w-full bg-gray-200 rounded-full overflow-hidden \${sizes[size]}\`}>
        <div
          className={\`h-full rounded-full transition-all duration-300 \${variants[variant]}\`}
          style={{ width: \`\${percentage}%\` }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-[#7A8B8C] mt-1 text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoading(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8 bg-[#F9F6F0] min-h-screen">
      <h2 className="text-2xl font-semibold text-[#2C3E50]">Progress Variants</h2>

      <div className="max-w-md space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2C3E50]">Default</label>
          <Progress value={60} showLabel />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2C3E50]">Success</label>
          <Progress value={100} variant="success" showLabel />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2C3E50]">Warning</label>
          <Progress value={45} variant="warning" showLabel />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2C3E50]">Info</label>
          <Progress value={75} variant="info" showLabel />
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-[#2C3E50]">Sizes</h2>

      <div className="max-w-md space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-[#7A8B8C]">Small</label>
          <Progress value={70} size="sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-[#7A8B8C]">Default</label>
          <Progress value={70} size="default" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-[#7A8B8C]">Large</label>
          <Progress value={70} size="lg" />
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-[#2C3E50]">Animated Loading</h2>

      <div className="max-w-md space-y-2">
        <Progress value={loading} showLabel />
        <p className="text-sm text-[#7A8B8C]">
          {loading < 100 ? 'Loading...' : 'Complete!'}
        </p>
      </div>
    </div>
  );
}`,
    },

    tooltip: {
        description: 'Tooltip for additional information',
        code: `import { useState } from 'react';

function Tooltip({ children, content, side = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[#2C3E50]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[#2C3E50]',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[#2C3E50]',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[#2C3E50]'
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={\`absolute z-50 px-3 py-1.5 text-xs text-white bg-[#2C3E50] rounded shadow-lg whitespace-nowrap \${positions[side]}\`}
        >
          {content}
          <div
            className={\`absolute w-0 h-0 border-4 border-transparent \${arrows[side]}\`}
          />
        </div>
      )}
    </div>
  );
}

function Button({ children, ...props }) {
  return (
    <button
      className="px-4 py-2 bg-[#C84B31] text-white rounded-md hover:bg-[#A63D2A] transition-colors"
      {...props}
    >
      {children}
    </button>
  );
}

export default function App() {
  return (
    <div className="p-8 space-y-12 bg-[#F9F6F0] min-h-screen">
      <h2 className="text-2xl font-semibold text-[#2C3E50]">Tooltip Positions</h2>

      <div className="flex flex-wrap gap-8 justify-center pt-8">
        <Tooltip content="Tooltip on top" side="top">
          <Button>Top</Button>
        </Tooltip>

        <Tooltip content="Tooltip on bottom" side="bottom">
          <Button>Bottom</Button>
        </Tooltip>

        <Tooltip content="Tooltip on left" side="left">
          <Button>Left</Button>
        </Tooltip>

        <Tooltip content="Tooltip on right" side="right">
          <Button>Right</Button>
        </Tooltip>
      </div>

      <h2 className="text-2xl font-semibold text-[#2C3E50]">Common Use Cases</h2>

      <div className="flex flex-wrap gap-4 justify-center">
        <Tooltip content="Click to save your changes" side="top">
          <Button>Save</Button>
        </Tooltip>

        <Tooltip content="This action cannot be undone" side="top">
          <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
            Delete
          </button>
        </Tooltip>

        <Tooltip content="Keyboard shortcut: Ctrl+C" side="top">
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
            Copy
          </button>
        </Tooltip>
      </div>
    </div>
  );
}`,
    },
};

// Get list of available component names
export const PREVIEWABLE_COMPONENTS = Object.keys(COMPONENT_TEMPLATES);

// Get template by name (case-insensitive)
export function getTemplate(name: string): ComponentTemplate | undefined {
    return COMPONENT_TEMPLATES[name.toLowerCase()];
}

// Check if a component has a preview template
export function hasTemplate(name: string): boolean {
    return name.toLowerCase() in COMPONENT_TEMPLATES;
}
