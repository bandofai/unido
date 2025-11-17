import type { FC } from 'react';

export interface WeatherCardProps {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  units: 'celsius' | 'fahrenheit';
  updatedAt?: string;
}

// Weather condition mapping for icons and gradients
const weatherStyles = {
  clear: {
    bgClass: 'bg-gradient-clear',
    icon: (
      <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Clear weather">
        <title>Clear weather</title>
        <circle cx="12" cy="12" r="4" fill="currentColor" className="text-yellow-300" />
        <path strokeLinecap="round" strokeWidth="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" className="text-yellow-400" />
      </svg>
    ),
  },
  sunny: {
    bgClass: 'bg-gradient-sunny',
    icon: (
      <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Sunny weather">
        <title>Sunny weather</title>
        <circle cx="12" cy="12" r="4" fill="currentColor" className="text-yellow-300" />
        <path strokeLinecap="round" strokeWidth="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" className="text-yellow-400" />
      </svg>
    ),
  },
  cloudy: {
    bgClass: 'bg-gradient-cloudy',
    icon: (
      <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24" aria-label="Cloudy weather">
        <title>Cloudy weather</title>
        <path d="M6.5 19a4.5 4.5 0 01-1.93-8.58 6 6 0 0111.82-1.28A4.5 4.5 0 0117.5 18h-11z" className="text-gray-300" />
      </svg>
    ),
  },
  'partly cloudy': {
    bgClass: 'bg-gradient-partly-cloudy',
    icon: (
      <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" aria-label="Partly cloudy weather">
        <title>Partly cloudy weather</title>
        <circle cx="15" cy="9" r="3" fill="currentColor" className="text-yellow-300" />
        <path fill="currentColor" d="M6.5 19a4.5 4.5 0 01-1.93-8.58 6 6 0 0111.82-1.28A4.5 4.5 0 0117.5 18h-11z" className="text-gray-200" />
      </svg>
    ),
  },
  rainy: {
    bgClass: 'bg-gradient-rainy',
    icon: (
      <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Rainy weather">
        <title>Rainy weather</title>
        <path fill="currentColor" d="M6.5 14a4.5 4.5 0 01-1.93-8.58 6 6 0 0111.82-1.28A4.5 4.5 0 0117.5 13h-11z" className="text-gray-300" />
        <path strokeLinecap="round" strokeWidth="2" d="M8 16v2m4-2v4m4-4v2" className="text-blue-400" />
      </svg>
    ),
  },
  snowy: {
    bgClass: 'bg-gradient-snowy',
    icon: (
      <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24" aria-label="Snowy weather">
        <title>Snowy weather</title>
        <path d="M6.5 14a4.5 4.5 0 01-1.93-8.58 6 6 0 0111.82-1.28A4.5 4.5 0 0117.5 13h-11z" className="text-gray-200" />
        <circle cx="8" cy="18" r="1" className="text-blue-200" />
        <circle cx="12" cy="19" r="1" className="text-blue-200" />
        <circle cx="16" cy="18" r="1" className="text-blue-200" />
      </svg>
    ),
  },
  default: {
    bgClass: 'bg-gradient-default',
    icon: (
      <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24" aria-label="Weather">
        <title>Weather</title>
        <path d="M6.5 17a4.5 4.5 0 01-1.93-8.58 6 6 0 0111.82-1.28A4.5 4.5 0 0117.5 16h-11z" className="text-gray-300" />
      </svg>
    ),
  },
};

const getWeatherStyle = (condition?: string) => {
  if (!condition) return weatherStyles.default;

  const normalized = condition.toLowerCase();
  if (normalized.includes('sun') || normalized.includes('clear')) return weatherStyles.sunny;
  if (normalized.includes('cloud')) return weatherStyles.cloudy;
  if (normalized.includes('partly')) return weatherStyles['partly cloudy'];
  if (normalized.includes('rain') || normalized.includes('drizzle')) return weatherStyles.rainy;
  if (normalized.includes('snow') || normalized.includes('sleet')) return weatherStyles.snowy;
  return weatherStyles.default;
};

const WeatherCard: FC<WeatherCardProps> = ({
  city,
  temperature,
  condition,
  humidity,
  units,
  updatedAt,
}) => {
  const unitLabel = units === 'celsius' ? '°C' : '°F';
  const style = getWeatherStyle(condition);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Card with Gradient Background */}
      <div className={`relative overflow-hidden rounded-3xl ${style.bgClass} shadow-2xl transition-all duration-500`}>
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

        {/* Content Container */}
        <div className="relative p-8">
          {/* Header: City & Time */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white drop-shadow-lg tracking-tight">
                {city}
              </h2>
              <p className="text-sm text-white/80 mt-1 font-medium">
                {updatedAt ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
              </p>
            </div>

            {/* Weather Icon */}
            <div className="transition-transform duration-300 hover:scale-110">
              {style.icon}
            </div>
          </div>

          {/* Temperature Display */}
          <div className="mb-6">
            <div className="flex items-baseline">
              <span className="text-7xl font-bold text-white drop-shadow-2xl tracking-tighter leading-none">
                {Math.round(temperature)}
              </span>
              <span className="text-4xl font-light text-white/90 ml-2">
                {unitLabel}
              </span>
            </div>
            <p className="text-xl text-white/90 mt-2 font-medium capitalize">
              {condition || 'Unknown'}
            </p>
          </div>

          {/* Bottom Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            {/* Humidity */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Humidity">
                <title>Humidity</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              </svg>
              <div>
                <p className="text-xs text-white/70 font-medium uppercase tracking-wide">Humidity</p>
                <p className="text-lg text-white font-semibold">{Math.round(humidity)}%</p>
              </div>
            </div>

            {/* Conditions */}
            <div className="text-right">
              <p className="text-xs text-white/70 font-medium uppercase tracking-wide">Conditions</p>
              <p className="text-lg text-white font-semibold">
                {humidity > 70 ? 'Humid' : humidity < 30 ? 'Dry' : 'Normal'}
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -top-6 -left-6 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default WeatherCard;
