/**
 * @bandofai/unido-components
 * shadcn/ui components for AI applications
 */

// shadcn/ui Card components
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './components/ui/card.js';

// shadcn/ui Table components
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './components/ui/table.js';

// shadcn/ui Form components
export { Button, buttonVariants } from './components/ui/button.js';
export type { ButtonProps } from './components/ui/button.js';

export { Input } from './components/ui/input.js';
export type { InputProps } from './components/ui/input.js';

export { Label } from './components/ui/label.js';

export { Textarea } from './components/ui/textarea.js';
export type { TextareaProps } from './components/ui/textarea.js';

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './components/ui/select.js';

// Loading and Error components
export { LoadingSpinner } from './components/ui/loading-spinner.js';
export type { LoadingSpinnerProps } from './components/ui/loading-spinner.js';

export { LoadingSkeleton } from './components/ui/loading-skeleton.js';
export type { LoadingSkeletonProps } from './components/ui/loading-skeleton.js';

export { ErrorCard } from './components/ui/error-card.js';
export type { ErrorCardProps } from './components/ui/error-card.js';

// Utilities
export { cn } from './lib/utils.js';
