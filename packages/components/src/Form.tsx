/**
 * Universal Form component
 * Handles form inputs with validation
 */

import React from 'react';

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
    const commonProps = {
      id: field.name,
      name: field.name,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        handleChange(field.name, e.target.value),
      placeholder: field.placeholder,
      required: field.required,
      style: {
        width: '100%',
        padding: '0.5rem 0.75rem',
        border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
        borderRadius: '0.375rem',
        fontSize: '0.875rem',
        outline: 'none',
        transition: 'border-color 0.2s',
      },
    };

    if (field.type === 'textarea') {
      return <textarea {...commonProps} rows={4} />;
    }

    if (field.type === 'select' && field.options) {
      return (
        <select {...commonProps}>
          <option value="">Select {field.label}</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return <input {...commonProps} type={field.type} />;
  };

  return (
    <form className={`unido-form ${className}`} onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div key={field.name} style={{ marginBottom: '1rem' }}>
          <label
            htmlFor={field.name}
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
            }}
          >
            {field.label}
            {field.required && (
              <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
            )}
          </label>
          {renderField(field)}
          {errors[field.name] && (
            <div
              style={{
                marginTop: '0.25rem',
                fontSize: '0.75rem',
                color: '#ef4444',
              }}
            >
              {errors[field.name]}
            </div>
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: '0.5rem 1.5rem',
          backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting) {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSubmitting) {
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }
        }}
      >
        {isSubmitting ? 'Submitting...' : submitLabel}
      </button>
    </form>
  );
}
