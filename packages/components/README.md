# @bandofai/unido-components

Universal UI components for AI applications built with **shadcn/ui** and **Tailwind CSS**.

## Features

- ✨ **Modern Design**: Built on shadcn/ui with Tailwind CSS
- ♿ **Accessible**: ARIA-compliant components using Radix UI primitives
- 🎨 **Themeable**: CSS custom properties with dark mode support
- 📦 **Tree-shakeable**: Import only what you need
- 🔒 **Type-safe**: Full TypeScript support
- 🎯 **Framework Agnostic**: Works with any AI provider through Unido

## Installation

```bash
pnpm add @bandofai/unido-components
```

### Peer Dependencies

Make sure you have React installed:

```bash
pnpm add react react-dom
```

## Quick Start

### 1. Import Global Styles

Add this to your app's entry point (e.g., `index.tsx` or `App.tsx`):

```typescript
import '@bandofai/unido-components/globals.css';
```

### 2. Use Components

```typescript
import { Card, Button, Form } from '@bandofai/unido-components';

function App() {
  return (
    <Card>
      <Card.Header>
        <h2>Welcome</h2>
      </Card.Header>
      <Card.Body>
        <p>This is a card component</p>
      </Card.Body>
      <Card.Footer>
        <Button>Click me</Button>
      </Card.Footer>
    </Card>
  );
}
```

## Components

### High-Level Components

#### Card
Versatile container with header, body, and footer sections.

```typescript
<Card className="max-w-md">
  <Card.Header>Header Content</Card.Header>
  <Card.Body>Main Content</Card.Body>
  <Card.Footer>Footer Content</Card.Footer>
</Card>
```

#### Table
Display tabular data with sorting and styling options.

```typescript
<Table
  columns={[
    { id: 'name', header: 'Name', accessor: 'name' },
    { id: 'email', header: 'Email', accessor: 'email' },
    { id: 'role', header: 'Role', accessor: 'role', align: 'right' },
  ]}
  data={users}
  striped
  hoverable
  emptyMessage="No users found"
/>
```

#### List
Display a list of items with optional icons and actions.

```typescript
<List
  items={[
    { id: 1, title: 'Item 1', description: 'Description', icon: '📄' },
    { id: 2, title: 'Item 2', description: 'Description', icon: '📁' },
  ]}
  onItemClick={(item) => console.log(item)}
  emptyMessage="No items to display"
/>
```

#### Form
Flexible form component with validation.

```typescript
<Form
  fields={[
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'you@example.com',
      required: true,
      validation: (value) => {
        if (!value.includes('@')) return 'Invalid email';
      },
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
  ]}
  onSubmit={async (data) => {
    console.log('Form submitted:', data);
  }}
  submitLabel="Sign Up"
/>
```

### shadcn/ui Components

Direct access to shadcn/ui primitives for custom UIs:

#### Button

```typescript
import { Button } from '@bandofai/unido-components';

<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

#### Input

```typescript
import { Input, Label } from '@bandofai/unido-components';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>
```

#### Select

```typescript
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@bandofai/unido-components';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Textarea

```typescript
import { Textarea } from '@bandofai/unido-components';

<Textarea placeholder="Enter description" rows={4} />
```

## Theming

### CSS Custom Properties

Components use CSS custom properties that you can override:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}
```

### Dark Mode

Apply the `dark` class to enable dark mode:

```typescript
<div className="dark">
  {/* All components inside will use dark mode */}
  <Card>...</Card>
</div>
```

### Custom Classes

All components accept `className` for Tailwind utilities:

```typescript
<Card className="shadow-lg border-2 max-w-md mx-auto">
  <Card.Header className="bg-primary text-primary-foreground">
    Custom styled header
  </Card.Header>
</Card>
```

## Utilities

### cn() Helper

Merge class names conditionally:

```typescript
import { cn } from '@bandofai/unido-components';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class'
)}>
  Content
</div>
```

## Migration

Upgrading from an older version? See [MIGRATION.md](./MIGRATION.md) for a complete guide.

## TypeScript Support

All components are fully typed with TypeScript:

```typescript
import type {
  CardProps,
  TableProps,
  TableColumn,
  TableRow,
  FormProps,
  FormField,
  ButtonProps,
} from '@bandofai/unido-components';
```

## Development

### Build

```bash
pnpm install
pnpm run build
```

### Watch Mode

```bash
pnpm run dev
```

### Type Check

```bash
pnpm run type-check
```

## License

MIT

## Credits

- Built with [shadcn/ui](https://ui.shadcn.com)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Powered by [Radix UI](https://www.radix-ui.com)
