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
      <svg className="w-40 h-40" fill="none" viewBox="0 0 120 120" aria-label="Clear weather">
        <title>Clear weather</title>
        {/* Outer glow rings */}
        <circle cx="60" cy="60" r="50" fill="url(#sunOuterGlow)" opacity="0.3" />
        <circle cx="60" cy="60" r="38" fill="url(#sunMiddleGlow)" opacity="0.4" />

        {/* Sun rays - alternating lengths for depth */}
        <g stroke="url(#rayGradient)" strokeWidth="3.5" strokeLinecap="round" opacity="0.95">
          <line x1="60" y1="10" x2="60" y2="22" />
          <line x1="60" y1="98" x2="60" y2="110" />
          <line x1="10" y1="60" x2="22" y2="60" />
          <line x1="98" y1="60" x2="110" y2="60" />
          <line x1="23" y1="23" x2="32" y2="32" />
          <line x1="88" y1="88" x2="97" y2="97" />
          <line x1="23" y1="97" x2="32" y2="88" />
          <line x1="88" y1="32" x2="97" y2="23" />
        </g>

        {/* Secondary shorter rays */}
        <g stroke="url(#rayGradient)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
          <line x1="60" y1="16" x2="60" y2="25" />
          <line x1="60" y1="95" x2="60" y2="104" />
          <line x1="16" y1="60" x2="25" y2="60" />
          <line x1="95" y1="60" x2="104" y2="60" />
        </g>

        {/* Sun core with multiple gradient layers */}
        <circle cx="60" cy="60" r="24" fill="url(#sunCore)" filter="url(#sunBloom)" />
        <circle cx="60" cy="60" r="24" fill="url(#sunHighlight)" opacity="0.6" />

        <defs>
          <radialGradient id="sunOuterGlow">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sunMiddleGlow">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sunCore">
            <stop offset="0%" stopColor="#FEF9E7" />
            <stop offset="40%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
          <radialGradient id="sunHighlight">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FFFBEB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rayGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>
          <filter id="sunBloom">
            <feGaussianBlur stdDeviation="1" />
          </filter>
        </defs>
      </svg>
    ),
  },
  sunny: {
    bgClass: 'bg-gradient-sunny',
    icon: (
      <svg className="w-40 h-40" fill="none" viewBox="0 0 120 120" aria-label="Sunny weather">
        <title>Sunny weather</title>
        {/* Outer glow rings */}
        <circle cx="60" cy="60" r="50" fill="url(#sunOuterGlow2)" opacity="0.3" />
        <circle cx="60" cy="60" r="38" fill="url(#sunMiddleGlow2)" opacity="0.4" />

        {/* Sun rays - alternating lengths for depth */}
        <g stroke="url(#rayGradient2)" strokeWidth="3.5" strokeLinecap="round" opacity="0.95">
          <line x1="60" y1="10" x2="60" y2="22" />
          <line x1="60" y1="98" x2="60" y2="110" />
          <line x1="10" y1="60" x2="22" y2="60" />
          <line x1="98" y1="60" x2="110" y2="60" />
          <line x1="23" y1="23" x2="32" y2="32" />
          <line x1="88" y1="88" x2="97" y2="97" />
          <line x1="23" y1="97" x2="32" y2="88" />
          <line x1="88" y1="32" x2="97" y2="23" />
        </g>

        {/* Secondary shorter rays */}
        <g stroke="url(#rayGradient2)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
          <line x1="60" y1="16" x2="60" y2="25" />
          <line x1="60" y1="95" x2="60" y2="104" />
          <line x1="16" y1="60" x2="25" y2="60" />
          <line x1="95" y1="60" x2="104" y2="60" />
        </g>

        {/* Sun core with multiple gradient layers */}
        <circle cx="60" cy="60" r="24" fill="url(#sunCore2)" filter="url(#sunBloom2)" />
        <circle cx="60" cy="60" r="24" fill="url(#sunHighlight2)" opacity="0.6" />

        <defs>
          <radialGradient id="sunOuterGlow2">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sunMiddleGlow2">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sunCore2">
            <stop offset="0%" stopColor="#FEF9E7" />
            <stop offset="40%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
          <radialGradient id="sunHighlight2">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FFFBEB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rayGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>
          <filter id="sunBloom2">
            <feGaussianBlur stdDeviation="1" />
          </filter>
        </defs>
      </svg>
    ),
  },
  cloudy: {
    bgClass: 'bg-gradient-cloudy',
    icon: (
      <svg className="w-40 h-40" fill="none" viewBox="0 0 120 120" aria-label="Cloudy weather">
        <title>Cloudy weather</title>
        {/* Shadow underneath clouds */}
        <ellipse cx="60" cy="95" rx="35" ry="4" fill="#94A3B8" opacity="0.15" />

        {/* Back cloud layer - larger */}
        <path
          d="M78 50c0-9.5-7.7-17-17-17-6.2 0-11.8 3.4-14.7 8.5-2.8-.3-5.3-.5-8.3-.5-12.7 0-23 10.3-23 23s10.3 23 23 23h40c9.5 0 17-7.7 17-17s-7.7-17-17-17z"
          fill="url(#cloudGrad1)"
          opacity="0.85"
        />

        {/* Main cloud - with enhanced shaping */}
        <path
          d="M68 62c0-7.7-6.3-14-14-14-5.1 0-9.6 2.8-12 6.9-2.5-.6-5-.9-7-.9-10.3 0-18.5 8.2-18.5 18.5S24.7 91 35 91h33c7.7 0 14-6.3 14-14s-6.3-14-14-14z"
          fill="url(#cloudGrad2)"
          filter="url(#cloudShadow)"
        />

        {/* Cloud highlights */}
        <ellipse cx="45" cy="68" rx="12" ry="8" fill="white" opacity="0.4" />
        <ellipse cx="58" cy="72" rx="10" ry="7" fill="white" opacity="0.3" />

        <defs>
          <linearGradient id="cloudGrad1" x1="60" y1="33" x2="60" y2="87">
            <stop offset="0%" stopColor="#F9FAFB" />
            <stop offset="50%" stopColor="#E5E7EB" />
            <stop offset="100%" stopColor="#D1D5DB" />
          </linearGradient>
          <linearGradient id="cloudGrad2" x1="51" y1="48" x2="51" y2="91">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#F3F4F6" />
            <stop offset="100%" stopColor="#E5E7EB" />
          </linearGradient>
          <filter id="cloudShadow">
            <feGaussianBlur stdDeviation="2" />
            <feOffset dy="1" />
          </filter>
        </defs>
      </svg>
    ),
  },
  'partly cloudy': {
    bgClass: 'bg-gradient-partly-cloudy',
    icon: (
      <svg
        className="w-40 h-40"
        fill="none"
        viewBox="0 0 120 120"
        aria-label="Partly cloudy weather"
      >
        <title>Partly cloudy weather</title>
        {/* Sun glow */}
        <circle cx="78" cy="38" r="22" fill="url(#partlySunGlow)" opacity="0.3" />

        {/* Sun with rays */}
        <g opacity="0.95">
          {/* Sun rays */}
          <g stroke="url(#partlyRayGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
            <line x1="78" y1="18" x2="78" y2="24" />
            <line x1="98" y1="38" x2="92" y2="38" />
            <line x1="90" y1="26" x2="86" y2="30" />
            <line x1="90" y1="50" x2="86" y2="46" />
            <line x1="66" y1="26" x2="70" y2="30" />
          </g>
          {/* Sun core */}
          <circle cx="78" cy="38" r="12" fill="url(#partlySunCore)" />
          <circle cx="78" cy="38" r="12" fill="url(#partlySunHighlight)" opacity="0.5" />
        </g>

        {/* Cloud shadow */}
        <ellipse cx="52" cy="92" rx="30" ry="3" fill="#94A3B8" opacity="0.12" />

        {/* Cloud */}
        <path
          d="M64 60c0-8.3-6.7-15-15-15-5.5 0-10.3 3-12.9 7.4-2.6-.4-5.1-.4-8.1-.4-11.3 0-20.5 9.2-20.5 20.5S16.7 93 28 93h36c8.3 0 15-6.7 15-15s-6.7-15-15-15z"
          fill="url(#partlyCloudGrad)"
          filter="url(#partlyCloudShadow)"
        />

        {/* Cloud highlights */}
        <ellipse cx="42" cy="70" rx="11" ry="7" fill="white" opacity="0.4" />
        <ellipse cx="54" cy="74" rx="9" ry="6" fill="white" opacity="0.3" />

        <defs>
          <radialGradient id="partlySunGlow">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="partlySunCore">
            <stop offset="0%" stopColor="#FEF9E7" />
            <stop offset="50%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
          <radialGradient id="partlySunHighlight">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="partlyRayGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>
          <linearGradient id="partlyCloudGrad" x1="48" y1="45" x2="48" y2="93">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#F9FAFB" />
            <stop offset="100%" stopColor="#E5E7EB" />
          </linearGradient>
          <filter id="partlyCloudShadow">
            <feGaussianBlur stdDeviation="1.5" />
            <feOffset dy="1" />
          </filter>
        </defs>
      </svg>
    ),
  },
  rainy: {
    bgClass: 'bg-gradient-rainy',
    icon: (
      <svg className="w-40 h-40" fill="none" viewBox="0 0 120 120" aria-label="Rainy weather">
        <title>Rainy weather</title>
        {/* Storm cloud - darker and more dramatic */}
        <path
          d="M68 42c0-9-7.3-16-16-16-5.9 0-11 3.2-13.8 7.9-2.8-.4-5.5-.4-8.2-.4-12 0-21.5 9.5-21.5 21.5S17.5 77 30 77h38c9 0 16-7.3 16-16s-7.3-16-16-16z"
          fill="url(#rainCloudGrad)"
          filter="url(#rainCloudBlur)"
        />

        {/* Cloud highlights for depth */}
        <ellipse cx="44" cy="52" rx="10" ry="6" fill="white" opacity="0.15" />

        {/* Rain drops - varied for realism */}
        <g stroke="url(#rainGrad)" strokeLinecap="round" opacity="0.9">
          <line x1="30" y1="82" x2="26" y2="96" strokeWidth="2.5" />
          <line x1="42" y1="80" x2="38" y2="98" strokeWidth="3" />
          <line x1="54" y1="82" x2="50" y2="96" strokeWidth="2.5" />
          <line x1="66" y1="81" x2="62" y2="94" strokeWidth="2.5" />
          <line x1="36" y1="88" x2="33" y2="99" strokeWidth="2" opacity="0.7" />
          <line x1="48" y1="87" x2="45" y2="100" strokeWidth="2.5" opacity="0.75" />
          <line x1="60" y1="89" x2="57" y2="99" strokeWidth="2" opacity="0.7" />
        </g>

        {/* Rain drop splash effect */}
        <g fill="#60A5FA" opacity="0.3">
          <circle cx="26" cy="97" r="1.5" />
          <circle cx="38" cy="99" r="1.5" />
          <circle cx="50" cy="97" r="1.5" />
        </g>

        <defs>
          <linearGradient id="rainCloudGrad" x1="52" y1="26" x2="52" y2="77">
            <stop offset="0%" stopColor="#9CA3AF" />
            <stop offset="50%" stopColor="#6B7280" />
            <stop offset="100%" stopColor="#4B5563" />
          </linearGradient>
          <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <filter id="rainCloudBlur">
            <feGaussianBlur stdDeviation="0.8" />
          </filter>
        </defs>
      </svg>
    ),
  },
  snowy: {
    bgClass: 'bg-gradient-snowy',
    icon: (
      <svg className="w-40 h-40" fill="none" viewBox="0 0 120 120" aria-label="Snowy weather">
        <title>Snowy weather</title>
        {/* Light snow cloud */}
        <path
          d="M66 44c0-8.5-6.9-15-15-15-5.5 0-10.3 3-12.9 7.5-2.7-.3-5.2-.5-8.1-.5-11.5 0-20.5 9-20.5 20.5S18.5 77 30 77h36c8.5 0 15-6.9 15-15s-6.9-15-15-15z"
          fill="url(#snowCloudGrad)"
          filter="url(#snowCloudSoft)"
        />

        {/* Cloud highlight */}
        <ellipse cx="44" cy="54" rx="12" ry="7" fill="white" opacity="0.5" />

        {/* Detailed snowflakes with varying sizes */}
        <g fill="white" opacity="0.95">
          {/* Large snowflake */}
          <g transform="translate(32, 85)">
            <circle r="1.5" fill="url(#snowflakeGrad)" />
            <line
              x1="-6"
              y1="0"
              x2="6"
              y2="0"
              stroke="url(#snowflakeStroke)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="-6"
              x2="0"
              y2="6"
              stroke="url(#snowflakeStroke)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="-4"
              y1="-4"
              x2="4"
              y2="4"
              stroke="url(#snowflakeStroke)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="-4"
              y1="4"
              x2="4"
              y2="-4"
              stroke="url(#snowflakeStroke)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* Branches */}
            <g stroke="url(#snowflakeStroke)" strokeWidth="0.8" strokeLinecap="round">
              <line x1="-4" y1="0" x2="-5" y2="-1.5" />
              <line x1="-4" y1="0" x2="-5" y2="1.5" />
              <line x1="4" y1="0" x2="5" y2="-1.5" />
              <line x1="4" y1="0" x2="5" y2="1.5" />
            </g>
          </g>

          {/* Medium snowflake */}
          <g transform="translate(52, 92)">
            <circle r="2" fill="url(#snowflakeGrad)" />
            <line
              x1="-7"
              y1="0"
              x2="7"
              y2="0"
              stroke="url(#snowflakeStroke)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="-7"
              x2="0"
              y2="7"
              stroke="url(#snowflakeStroke)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <line
              x1="-5"
              y1="-5"
              x2="5"
              y2="5"
              stroke="url(#snowflakeStroke)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <line
              x1="-5"
              y1="5"
              x2="5"
              y2="-5"
              stroke="url(#snowflakeStroke)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            {/* Branches */}
            <g stroke="url(#snowflakeStroke)" strokeWidth="1" strokeLinecap="round">
              <line x1="-5" y1="0" x2="-6" y2="-2" />
              <line x1="-5" y1="0" x2="-6" y2="2" />
              <line x1="5" y1="0" x2="6" y2="-2" />
              <line x1="5" y1="0" x2="6" y2="2" />
            </g>
          </g>

          {/* Small snowflake */}
          <g transform="translate(65, 87)">
            <circle r="1.5" fill="url(#snowflakeGrad)" />
            <line
              x1="-5"
              y1="0"
              x2="5"
              y2="0"
              stroke="url(#snowflakeStroke)"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="-5"
              x2="0"
              y2="5"
              stroke="url(#snowflakeStroke)"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <line
              x1="-3.5"
              y1="-3.5"
              x2="3.5"
              y2="3.5"
              stroke="url(#snowflakeStroke)"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <line
              x1="-3.5"
              y1="3.5"
              x2="3.5"
              y2="-3.5"
              stroke="url(#snowflakeStroke)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </g>

          {/* Tiny snowflakes */}
          <g transform="translate(42, 95)" opacity="0.8">
            <circle r="1" fill="white" />
            <line x1="-3" y1="0" x2="3" y2="0" stroke="white" strokeWidth="0.8" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="white" strokeWidth="0.8" />
          </g>
        </g>

        <defs>
          <linearGradient id="snowCloudGrad" x1="51" y1="29" x2="51" y2="77">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#F9FAFB" />
            <stop offset="100%" stopColor="#E5E7EB" />
          </linearGradient>
          <radialGradient id="snowflakeGrad">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </radialGradient>
          <linearGradient id="snowflakeStroke">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#DBEAFE" />
          </linearGradient>
          <filter id="snowCloudSoft">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
        </defs>
      </svg>
    ),
  },
  default: {
    bgClass: 'bg-gradient-default',
    icon: (
      <svg className="w-40 h-40" fill="none" viewBox="0 0 120 120" aria-label="Weather">
        <title>Weather</title>
        {/* Cloud shadow */}
        <ellipse cx="60" cy="92" rx="32" ry="3" fill="#94A3B8" opacity="0.15" />

        {/* Generic cloud with depth */}
        <path
          d="M67 52c0-8.5-6.9-15-15-15-5.5 0-10.3 3-12.9 7.5-2.7-.3-5.2-.5-8.1-.5-11.5 0-20.5 9-20.5 20.5S19.5 85 31 85h36c8.5 0 15-6.9 15-15s-6.9-15-15-15z"
          fill="url(#defaultCloudGrad)"
          filter="url(#defaultShadow)"
        />

        {/* Cloud highlights */}
        <ellipse cx="45" cy="62" rx="11" ry="7" fill="white" opacity="0.45" />
        <ellipse cx="56" cy="66" rx="9" ry="6" fill="white" opacity="0.35" />

        <defs>
          <linearGradient id="defaultCloudGrad" x1="52" y1="37" x2="52" y2="85">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#F9FAFB" />
            <stop offset="100%" stopColor="#E5E7EB" />
          </linearGradient>
          <filter id="defaultShadow">
            <feGaussianBlur stdDeviation="1.5" />
            <feOffset dy="1" />
          </filter>
        </defs>
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

  // Format time from updatedAt
  const formattedTime = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Card with modern design */}
      <div
        className={`relative overflow-hidden rounded-[2rem] ${style.bgClass} shadow-[0_20px_60px_rgba(0,0,0,0.3)]`}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-[0.15]">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full blur-[100px] transform translate-x-32 -translate-y-32" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-white rounded-full blur-[80px] transform -translate-x-24 translate-y-24" />
        </div>

        {/* Content */}
        <div className="relative px-8 py-10">
          {/* Top section - Weather condition with location icon and time */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2.5">
              <svg
                className="w-5 h-5 text-white drop-shadow-lg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="Location"
              >
                <title>Location</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div>
                <p className="text-sm text-white drop-shadow-lg uppercase tracking-wider font-semibold">
                  {city}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white drop-shadow-md font-medium">{formattedTime}</p>
            </div>
          </div>

          {/* Main temperature display with large icon */}
          <div className="flex items-start justify-between mb-10">
            {/* Temperature - Large and prominent */}
            <div>
              <div className="flex items-start mb-5">
                <span className="text-[7rem] font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] leading-none tracking-tighter">
                  {Math.round(temperature)}
                </span>
                <span className="text-4xl font-light text-white drop-shadow-lg mt-4 ml-2">
                  {unitLabel}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">{condition}</h2>
              <p className="text-sm text-white drop-shadow-md opacity-90">{formattedDate}</p>
            </div>

            {/* Weather Icon - Positioned on right */}
            <div className="flex-shrink-0 opacity-95 drop-shadow-2xl mt-4">{style.icon}</div>
          </div>

          {/* Divider with subtle gradient */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent mb-8 opacity-25" />

          {/* Bottom stats - Humidity and Feels */}
          <div className="grid grid-cols-2 gap-5">
            {/* Humidity */}
            <div className="bg-black/19 rounded-[1.25rem] p-5 backdrop-blur-md shadow-lg">
              <p className="text-xs text-white drop-shadow-md opacity-80 mb-2 uppercase tracking-wide font-medium">
                Humidity
              </p>
              <p className="text-3xl font-bold text-white drop-shadow-lg">
                {Math.round(humidity)}%
              </p>
            </div>

            {/* Feels like */}
            <div className="bg-black/19 rounded-[1.25rem] p-5 backdrop-blur-md shadow-lg">
              <p className="text-xs text-white drop-shadow-md opacity-80 mb-2 uppercase tracking-wide font-medium">
                Feels
              </p>
              <p className="text-3xl font-bold text-white drop-shadow-lg">
                {humidity > 70 ? 'Humid' : humidity < 30 ? 'Dry' : 'Good'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
