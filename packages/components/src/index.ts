/**
 * @bandofai/unido-components
 * Universal UI components for AI applications
 */

// High-level components
export { Card, CardTitle, CardDescription } from './Card.js';
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from './Card.js';

export { List } from './List.js';
export type { ListProps, ListItem } from './List.js';

export { Table } from './Table.js';
export type { TableProps, TableColumn, TableRow } from './Table.js';

export { Form } from './Form.js';
export type { FormProps, FormField } from './Form.js';

// shadcn/ui components (re-exported for direct use)
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

export {
  Card as ShadcnCard,
  CardHeader,
  CardFooter,
  CardContent,
} from './components/ui/card.js';

export {
  Table as ShadcnTable,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow as ShadcnTableRow,
  TableCell,
  TableCaption,
} from './components/ui/table.js';

// Utilities
export { cn } from './lib/utils.js';
