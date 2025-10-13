/**
 * Universal Card component
 */

import type React from 'react';

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
  return (
    <div
      className={`unido-card ${className}`}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        backgroundColor: 'white',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div
      className={`unido-card-header ${className}`}
      style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #e5e7eb',
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = '' }: CardBodyProps) {
  return (
    <div
      className={`unido-card-body ${className}`}
      style={{
        padding: '1.5rem',
      }}
    >
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div
      className={`unido-card-footer ${className}`}
      style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
      }}
    >
      {children}
    </div>
  );
};
