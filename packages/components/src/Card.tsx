/**
 * Universal Card component - shadcn/ui wrapper
 */

import type React from 'react';
import {
  Card as ShadcnCard,
  CardHeader as ShadcnCardHeader,
  CardContent as ShadcnCardContent,
  CardFooter as ShadcnCardFooter,
  CardTitle,
  CardDescription,
} from './components/ui/card.js';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return <ShadcnCard className={className}>{children}</ShadcnCard>;
}

Card.Header = function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <ShadcnCardHeader className={className}>{children}</ShadcnCardHeader>;
};

Card.Body = function CardBody({ children, className = '' }: CardBodyProps) {
  return <ShadcnCardContent className={className}>{children}</ShadcnCardContent>;
};

Card.Footer = function CardFooter({ children, className = '' }: CardFooterProps) {
  return <ShadcnCardFooter className={className}>{children}</ShadcnCardFooter>;
};

// Re-export additional components
export { CardTitle, CardDescription };
