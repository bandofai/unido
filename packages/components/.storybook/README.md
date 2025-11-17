# Unido Components Storybook

Interactive component showcase for `@bandofai/unido-components`.

## Running Storybook

```bash
# Development server (http://localhost:6006)
pnpm run storybook

# Build static version
pnpm run storybook:build

# Test stories
pnpm run storybook:test
```

## Features

- **Component Documentation**: Auto-generated docs for all components
- **Dark Mode Support**: Toggle between light and dark themes
- **Accessibility Testing**: Built-in a11y addon
- **Interactive Controls**: Modify component props in real-time
- **TypeScript Integration**: Full type safety and IntelliSense

## Available Components

### UI Primitives
- **Button** - All variants (default, destructive, outline, secondary, ghost, link)
- **Card** - Flexible container with header, content, and footer
- **Input** - Form input with label support
- **Textarea** - Multi-line text input
- **Label** - Form labels
- **Select** - Dropdown selection with groups
- **Table** - Data tables with headers, footers, and captions

### State Components
- **LoadingSpinner** - Animated spinner with size variants
- **LoadingSkeleton** - Placeholder skeleton for loading states
- **ErrorCard** - Error display with retry functionality

## Configuration

- **Main Config**: [`.storybook/main.ts`](.storybook/main.ts)
- **Preview Config**: [`.storybook/preview.tsx`](.storybook/preview.tsx)

## Writing Stories

Stories are co-located with components in `src/components/ui/*.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};
```

## Deployment

The static build in `storybook-static/` can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

```bash
pnpm run storybook:build
# Deploy storybook-static/ directory
```
