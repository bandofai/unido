/**
 * Weather Card Error State Component
 * Demonstrates custom error component for weather data
 */

import type { FC } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bandofai/unido-components';

export interface WeatherCardErrorProps {
  city?: string;
  error: string;
  code?: string;
  details?: string;
}

export const WeatherCardError: FC<WeatherCardErrorProps> = ({
  city,
  error,
  code,
  details,
}) => {
  return (
    <Card className="w-full max-w-md border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01"
            />
          </svg>
          Weather Error
        </CardTitle>
        <CardDescription>
          {city ? `Could not fetch weather for ${city}` : 'Failed to load weather data'}
        </CardDescription>
        {code && <CardDescription className="font-mono text-xs">{code}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{error}</p>
        {details && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">
              Show technical details
            </summary>
            <pre className="mt-2 whitespace-pre-wrap rounded bg-muted p-2">
              {details}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};
