/**
 * Weather Card Loading State Component
 * Demonstrates custom loading component for weather data
 */

import type { FC } from 'react';
import { Card, CardContent, CardHeader, LoadingSkeleton } from '@bandofai/unido-components';

export interface WeatherCardLoadingProps {
  city?: string;
  message?: string;
}

export const WeatherCardLoading: FC<WeatherCardLoadingProps> = ({ city, message }) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="space-y-2">
          <div className="h-6 w-32 rounded bg-muted animate-pulse" />
          {city && (
            <p className="text-sm text-muted-foreground">
              Loading weather for {city}...
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <LoadingSkeleton
          lines={3}
          message={message || 'Fetching weather data...'}
        />
      </CardContent>
    </Card>
  );
};
