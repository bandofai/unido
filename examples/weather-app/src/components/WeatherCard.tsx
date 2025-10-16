import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@bandofai/unido-components';
import type { FC } from 'react';

export interface WeatherCardProps {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  units: 'celsius' | 'fahrenheit';
  updatedAt?: string;
}

const WeatherCard: FC<WeatherCardProps> = ({
  city,
  temperature,
  condition,
  humidity,
  units,
  updatedAt,
}) => {
  const unitLabel = units === 'celsius' ? '°C' : '°F';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{city}</CardTitle>
        <CardDescription>
          {updatedAt ? new Date(updatedAt).toLocaleTimeString() : 'Live update'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-semibold">
          {Math.round(temperature)}
          {unitLabel}
        </div>
        <p className="mt-2 text-muted-foreground">{condition}</p>
      </CardContent>
      <CardFooter>
        <span className="text-muted-foreground">Humidity: {Math.round(humidity)}%</span>
      </CardFooter>
    </Card>
  );
};

export default WeatherCard;
