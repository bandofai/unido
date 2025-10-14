import { Card } from '@bandofai/unido-components';
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
      <Card.Header>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{city}</h2>
        <p style={{ margin: 0, color: '#6b7280' }}>{updatedAt ?? 'Live update'}</p>
      </Card.Header>
      <Card.Body>
        <div style={{ fontSize: '2.5rem', fontWeight: 600 }}>
          {Math.round(temperature)}
          {unitLabel}
        </div>
        <p style={{ margin: '0.5rem 0 0', color: '#4b5563' }}>{condition}</p>
      </Card.Body>
      <Card.Footer>
        <span style={{ color: '#4b5563' }}>Humidity: {Math.round(humidity)}%</span>
      </Card.Footer>
    </Card>
  );
};

export default WeatherCard;
