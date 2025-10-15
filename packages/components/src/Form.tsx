/**
 * Universal Form component - shadcn/ui wrapper
 * Handles form inputs with validation
 */

import React from 'react';
import { Button } from './components/ui/button.js';
import { Input } from './components/ui/input.js';
import { Label } from './components/ui/label.js';
import { Textarea } from './components/ui/textarea.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select.js';
import { cn } from './lib/utils.js';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'password' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string | number }[];
  validation?: (value: string) => string | undefined;
}

export interface FormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => void | Promise<void>;
  submitLabel?: string;
  className?: string;
}

export function Form({ fields, onSubmit, submitLabel = 'Submit', className = '' }: FormProps) {
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const field of fields) {
      const value = values[field.name] || '';

      // Required validation
      if (field.required && !value.trim()) {
        newErrors[field.name] = `${field.label} is required`;
        continue;
      }

      // Custom validation
      if (field.validation && value) {
        const error = field.validation(value);
        if (error) {
          newErrors[field.name] = error;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      // Clear form on success
      setValues({});
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = values[field.name] || '';
    const error = errors[field.name];

    if (field.type === 'textarea') {
      return (
        <Textarea
          id={field.name}
          name={field.name}
          value={value}
          onChange={(e) => handleChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          className={cn(error && 'border-destructive')}
          rows={4}
        />
      );
    }

    if (field.type === 'select' && field.options) {
      return (
        <Select value={value} onValueChange={(val) => handleChange(field.name, val)}>
          <SelectTrigger className={cn(error && 'border-destructive')}>
            <SelectValue placeholder={`Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        id={field.name}
        name={field.name}
        type={field.type}
        value={value}
        onChange={(e) => handleChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        className={cn(error && 'border-destructive')}
      />
    );
  };

  return (
    <form className={cn('space-y-4', className)} onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {renderField(field)}
          {errors[field.name] && (
            <p className="text-sm text-destructive">{errors[field.name]}</p>
          )}
        </div>
      ))}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : submitLabel}
      </Button>
    </form>
  );
}
