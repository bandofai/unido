/**
 * Project templates
 */

/**
 * Options for template generation
 */
export interface TemplateOptions {
  projectName: string;
}

export function getPackageJson(options: TemplateOptions): Record<string, unknown> {
  return {
    name: options.projectName,
    version: '1.0.0',
    type: 'module',
    description: 'OpenAI App built with Unido',
    main: './dist/index.js',
    scripts: {
      build: 'tsc',
      dev: 'node --import tsx src/index.ts',
      start: 'node dist/index.js',
      'type-check': 'tsc --noEmit',
      inspect:
        'npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse --method tools/list',
      tunnel: 'ngrok http 3000',
    },
    dependencies: {
      '@bandofai/unido-core': '^0.1.12',
      '@bandofai/unido-provider-openai': '^0.1.23',
      '@bandofai/unido-components': '^0.2.8',
      '@bandofai/unido-dev': '^0.1.15',
      dotenv: '^16.4.7',
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      zod: '^3.24.1',
    },
    devDependencies: {
      '@types/node': '^22.10.7',
      '@types/react': '^18.3.18',
      '@types/react-dom': '^18.3.5',
      typescript: '^5.7.3',
      tsx: '^4.19.2',
      tailwindcss: '^4.0.0',
      '@tailwindcss/postcss': '^4.0.0',
      autoprefixer: '^10.4.20',
      postcss: '^8.4.49',
      'postcss-cli': '^11.0.1',
    },
    engines: {
      node: '>=18.0.0',
    },
  };
}

export function getTsConfig(): Record<string, unknown> {
  return {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
      resolveJsonModule: true,
      outDir: './dist',
      rootDir: './src',
      declaration: true,
      sourceMap: true,
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      isolatedModules: true,
      verbatimModuleSyntax: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };
}

export function getGitignore(): string {
  return `# Dependencies
node_modules/
.pnp
.pnp.js
store/

# Build output
dist/
build/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.production

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Testing
coverage/

# Cache
.turbo/
.cache/
`;
}

export function getNpmrc(): string {
  return `# Use shared global store instead of creating local store folders
store-dir=~/.pnpm-store

# Hoist dependencies to root for better compatibility
shamefully-hoist=true

# Automatically install peer dependencies
auto-install-peers=true
`;
}

export function getReadme(options: TemplateOptions): string {
  return `# ${options.projectName}

OpenAI App built with [Unido](https://github.com/bandofai/unido) - a framework for building OpenAI custom tools.

## Features

- ✅ Type-safe with TypeScript and Zod
- ✅ Built on Model Context Protocol (MCP)
- ✅ Includes a ready-to-bundle ChatGPT widget component
- ✅ Hot reload in development
- ✅ Easy integration with ChatGPT

## Installation

\`\`\`bash
npm install
\`\`\`

## Configuration

You can customize the server port by creating a \`.env\` file in the root directory:

\`\`\`bash
# Copy the example file
cp .env.example .env

# Edit .env and set your preferred port
UNIDO_OPENAI_PORT=8080
\`\`\`

If no \`.env\` file is present, the server will default to port 3000.

## Development

\`\`\`bash
npm run dev
\`\`\`

The server will run on http://localhost:3000

### Testing with MCP Inspector

You can verify your MCP server is working correctly using the MCP Inspector. Make sure your server is running first (\`npm run dev\` or \`npm run start\`).

**List all tools:**
\`\`\`bash
npm run inspect
\`\`\`

**List all resources:**
\`\`\`bash
node node_modules/@modelcontextprotocol/inspector/bin/cli.js http://localhost:3000/sse --transport sse --method resources/list
\`\`\`

**Test a specific tool:**
\`\`\`bash
node node_modules/@modelcontextprotocol/inspector/bin/cli.js http://localhost:3000/sse --transport sse --method tools/call --params '{"name":"greet","arguments":{"name":"World"}}'
\`\`\`

The inspector works with both development (\`npm run dev\`) and production (\`npm run start\`) builds as both use port 3000.

## OpenAI ChatGPT Setup

### Local Development (Desktop App)

For local development with ChatGPT Desktop App:

1. Make sure your development server is running
2. Open ChatGPT → Settings → Custom Tools
3. Click "Add Server"
4. Enter URL: http://localhost:3000
5. Start using your tools in ChatGPT!

### Testing with ChatGPT Web (Public Access)

ChatGPT web version cannot access localhost. Use ngrok to create a public tunnel:

\`\`\`bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Create public tunnel
npm run tunnel
\`\`\`

ngrok will output a URL like \`https://abc123.ngrok.io\`. Use this in ChatGPT:
- Add Server URL: \`https://abc123.ngrok.io/sse\`

**Note:** You need ngrok installed. Get it from https://ngrok.com/download or:
\`\`\`bash
brew install ngrok  # macOS
\`\`\`

## Build

\`\`\`bash
npm run build
npm start
\`\`\`

## Project Structure

\`\`\`
${options.projectName}/
├── src/
│   ├── components/
│   │   └── GreetingCard.tsx   # React widget rendered in ChatGPT
│   └── index.ts               # Main application & tool registration
├── dist/              # Build output
├── package.json
├── tsconfig.json
└── README.md
\`\`\`

## Learn More

- [Unido Documentation](https://github.com/bandofai/unido)
- [OpenAI Custom Tools](https://platform.openai.com/docs/guides/custom-tools)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

MIT
`;
}

export function getGlobalsCss(): string {
  return `@import "tailwindcss";

@theme {
  /* Colors - shadcn/ui palette in oklch format */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.24 0.02 264.4);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.24 0.02 264.4);
  --color-popover: oklch(1 0 0);
  --color-popover-foreground: oklch(0.24 0.02 264.4);
  --color-primary: oklch(0.18 0.01 264.4);
  --color-primary-foreground: oklch(0.97 0 0);
  --color-secondary: oklch(0.96 0.01 264.4);
  --color-secondary-foreground: oklch(0.18 0.01 264.4);
  --color-muted: oklch(0.96 0.01 264.4);
  --color-muted-foreground: oklch(0.53 0.01 257.2);
  --color-accent: oklch(0.96 0.01 264.4);
  --color-accent-foreground: oklch(0.18 0.01 264.4);
  --color-destructive: oklch(0.58 0.23 27.33);
  --color-destructive-foreground: oklch(0.97 0 0);
  --color-border: oklch(0.89 0.01 264.4);
  --color-input: oklch(0.89 0.01 264.4);
  --color-ring: oklch(0.24 0.02 264.4);

  /* Chart colors */
  --color-chart-1: oklch(0.64 0.19 27.33);
  --color-chart-2: oklch(0.53 0.11 197);
  --color-chart-3: oklch(0.43 0.08 214.3);
  --color-chart-4: oklch(0.71 0.18 43);
  --color-chart-5: oklch(0.69 0.21 27);

  /* Typography */
  --font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

  /* Layout */
  --radius: 0.5rem;
}

@layer base {
  * {
    border-color: hsl(var(--color-border));
  }

  body {
    background: hsl(var(--color-background));
    color: hsl(var(--color-foreground));
    font-family: var(--font-sans);
  }

  /* Dark mode - using :root.dark selector */
  :root.dark,
  .dark {
    --color-background: oklch(0.24 0.02 264.4);
    --color-foreground: oklch(0.97 0 0);
    --color-card: oklch(0.24 0.02 264.4);
    --color-card-foreground: oklch(0.97 0 0);
    --color-popover: oklch(0.24 0.02 264.4);
    --color-popover-foreground: oklch(0.97 0 0);
    --color-primary: oklch(0.97 0 0);
    --color-primary-foreground: oklch(0.18 0.01 264.4);
    --color-secondary: oklch(0.28 0.01 264.4);
    --color-secondary-foreground: oklch(0.97 0 0);
    --color-muted: oklch(0.28 0.01 264.4);
    --color-muted-foreground: oklch(0.64 0.01 257.2);
    --color-accent: oklch(0.28 0.01 264.4);
    --color-accent-foreground: oklch(0.97 0 0);
    --color-destructive: oklch(0.42 0.19 27.33);
    --color-destructive-foreground: oklch(0.97 0 0);
    --color-border: oklch(0.28 0.01 264.4);
    --color-input: oklch(0.28 0.01 264.4);
    --color-ring: oklch(0.83 0.01 257.2);

    /* Chart colors - dark theme */
    --color-chart-1: oklch(0.54 0.17 220);
    --color-chart-2: oklch(0.52 0.12 160);
    --color-chart-3: oklch(0.61 0.19 30);
    --color-chart-4: oklch(0.65 0.16 280);
    --color-chart-5: oklch(0.62 0.18 340);
  }
}
`;
}

export function getWeatherGlobalsCss(): string {
  return `/* Import base styles from components package */
@import "@bandofai/unido-components/globals.css";

/* Weather-specific extensions */
@theme {
  /* Weather-specific colors */
  --color-white: rgb(255 255 255);
  --color-gray-200: rgb(229 231 235);
  --color-gray-300: rgb(209 213 219);
  --color-gray-400: rgb(156 163 175);
  --color-slate-300: rgb(203 213 225);
  --color-slate-400: rgb(148 163 184);
  --color-slate-500: rgb(100 116 139);
  --color-blue-100: rgb(219 234 254);
  --color-blue-200: rgb(191 219 254);
  --color-blue-300: rgb(147 197 253);
  --color-blue-400: rgb(96 165 250);
  --color-cyan-300: rgb(103 232 249);
  --color-teal-200: rgb(153 246 228);
  --color-orange-400: rgb(251 146 60);
  --color-yellow-100: rgb(254 249 195);
  --color-yellow-200: rgb(254 240 138);
  --color-yellow-300: rgb(253 224 71);

  /* Weather gradients */
  --gradient-sunny: linear-gradient(135deg, rgb(251 146 60) 0%, rgb(252 185 65) 25%, rgb(253 210 90) 50%, rgb(253 224 71) 75%, rgb(254 240 138) 100%);
  --gradient-clear: linear-gradient(135deg, rgb(96 165 250) 0%, rgb(110 180 251) 25%, rgb(130 190 252) 50%, rgb(180 210 250) 75%, rgb(254 240 138) 100%);
  --gradient-cloudy: linear-gradient(135deg, rgb(156 163 175) 0%, rgb(175 180 190) 25%, rgb(190 195 205) 50%, rgb(200 207 217) 75%, rgb(191 219 254) 100%);
  --gradient-partly-cloudy: linear-gradient(135deg, rgb(147 197 253) 0%, rgb(170 205 252) 25%, rgb(195 215 248) 50%, rgb(220 225 235) 75%, rgb(254 249 195) 100%);
  --gradient-rainy: linear-gradient(135deg, rgb(100 116 139) 0%, rgb(115 130 155) 25%, rgb(130 145 170) 50%, rgb(140 160 200) 75%, rgb(147 197 253) 100%);
  --gradient-snowy: linear-gradient(135deg, rgb(203 213 225) 0%, rgb(210 220 235) 25%, rgb(220 230 245) 50%, rgb(235 240 250) 75%, rgb(255 255 255) 100%);
  --gradient-default: linear-gradient(135deg, rgb(96 165 250) 0%, rgb(99 185 250) 25%, rgb(101 205 249) 50%, rgb(120 220 240) 75%, rgb(153 246 228) 100%);
}

/* Weather gradient utilities */
@layer utilities {
  .bg-gradient-sunny { background-image: var(--gradient-sunny); }
  .bg-gradient-clear { background-image: var(--gradient-clear); }
  .bg-gradient-cloudy { background-image: var(--gradient-cloudy); }
  .bg-gradient-partly-cloudy { background-image: var(--gradient-partly-cloudy); }
  .bg-gradient-rainy { background-image: var(--gradient-rainy); }
  .bg-gradient-snowy { background-image: var(--gradient-snowy); }
  .bg-gradient-default { background-image: var(--gradient-default); }

  /* Safelist weather card utilities */
  .text-white { color: var(--color-white); }
  .bg-white { background-color: var(--color-white); }
  .border-white { border-color: var(--color-white); }
  .text-yellow-300 { color: var(--color-yellow-300); }
  .text-yellow-400 { color: oklch(85.2% 0.199 91.936); }
  .text-gray-200 { color: var(--color-gray-200); }
  .text-gray-300 { color: var(--color-gray-300); }
  .text-blue-200 { color: var(--color-blue-200); }
  .text-blue-300 { color: var(--color-blue-300); }
  .text-blue-400 { color: var(--color-blue-400); }
  .text-black { color: rgb(0 0 0); }
  .bg-black { background-color: rgb(0 0 0); }
  .border-black { border-color: rgb(0 0 0); }

  /* Enhanced text shadows for readability */
  .text-shadow-strong {
    text-shadow: 0 0px 3px rgba(0, 0, 0, 0.5);
  }

  .text-shadow-xl {
    text-shadow: 0 0px 8px rgba(0, 0, 0, 0.5);
  }

  .text-shadow-subtle {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
}
`;
}

export function getPostCssConfig(): string {
  return `export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
`;
}

export function getBasicTemplate(options: TemplateOptions): string {
  return `import 'dotenv/config';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { componentResponse, createApp, textResponse } from '@bandofai/unido-core';
import type { ComponentMetadata, ProviderName } from '@bandofai/unido-core';
import { openAI } from '@bandofai/unido-provider-openai';
import { z } from 'zod';

// ============================================================================
// Utilities
// ============================================================================

function resolveComponentPath(relativePath: string): string {
  const normalized = relativePath.startsWith('./') ? relativePath.slice(2) : relativePath;
  const distUrl = new URL(
    normalized.startsWith('components/') ? \`./\${normalized}\` : \`./components/\${normalized}\`,
    import.meta.url
  );
  const distPath = fileURLToPath(distUrl);

  if (existsSync(distPath)) {
    return distPath;
  }

  const srcUrl = new URL(\`../src/\${normalized}\`, import.meta.url);
  return fileURLToPath(srcUrl);
}

// ============================================================================
// Register Components
// ============================================================================

const greetingCardPath = resolveComponentPath('components/GreetingCard.tsx');

// ============================================================================
// Create Unido App
// ============================================================================

const app = createApp({
  name: '${options.projectName}',
  version: '1.0.0',
  providers: {
    openai: openAI({
      port: Number(process.env.UNIDO_OPENAI_PORT) || 3000,
      watch: true, // Enable HMR for components and CSS files
    })
  },
});

app.component({
  type: 'greeting-card',
  title: 'Greeting Card',
  description: 'Shows a personalized greeting message to the user.',
  sourcePath: greetingCardPath,
  propsSchema: {
    name: {
      type: 'string',
      required: true,
      description: 'Name of the person to greet',
    },
    greeting: {
      type: 'string',
      required: true,
      description: 'Greeting message to display',
    },
  },
  metadata: {
    openai: {
      renderHints: {
        widgetAccessible: true,
      },
    },
  } as Partial<Record<ProviderName, ComponentMetadata>>,
});

// ============================================================================
// Register Tools
// ============================================================================

app.tool('greet', {
  title: 'Greet User',
  description: 'Greet a user by name',
  input: z.object({
    name: z.string().describe('Name of the person to greet'),
  }),
  handler: async ({ name }: { name: string }) => {
    return componentResponse(
      'greeting-card',
      { name, greeting: \`Hello, \${name}!\` } as Record<string, unknown>,
      \`Hello, \${name}!\`
    );
  },
});

app.tool('calculate', {
  title: 'Calculate',
  description: 'Perform basic arithmetic operations',
  input: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('Arithmetic operation'),
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
  handler: async ({ operation, a, b }: { operation: 'add' | 'subtract' | 'multiply' | 'divide'; a: number; b: number }) => {
    let result: number | undefined;

    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b === 0) {
          return textResponse('Error: Division by zero');
        }
        result = a / b;
        break;
    }

    return textResponse(\`\${a} \${operation} \${b} = \${result}\`);
  },
});

// ============================================================================
// Start Server
// ============================================================================

console.log('🚀 Starting Unido app...\\n');

await app.listen();

console.log('✅ Server started successfully!\\n');

process.on('SIGINT', async () => {
  console.log('\\n\\n👋 Shutting down...');
  process.exit(0);
});

// Export app for widget development
export { app };
`;
}

export function getWeatherTemplate(options: TemplateOptions): string {
  return `import 'dotenv/config';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { componentResponse, createApp, textResponse } from '@bandofai/unido-core';
import type { ComponentMetadata, ProviderName } from '@bandofai/unido-core';
import { openAI } from '@bandofai/unido-provider-openai';
import { z } from 'zod';

// ============================================================================
// Utilities
// ============================================================================

function resolveComponentPath(relativePath: string): string {
  const normalized = relativePath.startsWith('./') ? relativePath.slice(2) : relativePath;
  const distUrl = new URL(
    normalized.startsWith('components/') ? \`./\${normalized}\` : \`./components/\${normalized}\`,
    import.meta.url
  );
  const distPath = fileURLToPath(distUrl);

  if (existsSync(distPath)) {
    return distPath;
  }

  const srcUrl = new URL(\`../src/\${normalized}\`, import.meta.url);
  return fileURLToPath(srcUrl);
}

// ============================================================================
// Mock Weather API
// ============================================================================

interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  units: 'celsius' | 'fahrenheit';
  updatedAt: string;
}

const CONDITIONS = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'] as const;

async function fetchWeather(city: string, units: 'celsius' | 'fahrenheit'): Promise<WeatherData> {
  const baseTemp = units === 'celsius' ? 22 : 72;

  const conditionIndex = Math.floor(Math.random() * CONDITIONS.length);
  const condition = CONDITIONS[conditionIndex] ?? 'Sunny';

  return {
    city,
    temperature: baseTemp + Math.random() * 10,
    condition,
    humidity: 60 + Math.random() * 30,
    units,
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Register Components
// ============================================================================

const weatherCardPath = resolveComponentPath('components/WeatherCard.tsx');

// ============================================================================
// Create Unido App
// ============================================================================

const app = createApp({
  name: '${options.projectName}',
  version: '1.0.0',
  providers: {
    openai: openAI({
      port: Number(process.env.UNIDO_OPENAI_PORT) || 3000,
      watch: true, // Enable HMR for components and CSS files
    })
  },
});

app.component({
  type: 'weather-card',
  title: 'Weather Card',
  description: 'Displays a quick overview of the current weather for a city.',
  sourcePath: weatherCardPath,
  propsSchema: {
    city: {
      type: 'string',
      required: true,
      description: 'City name',
    },
    temperature: {
      type: 'number',
      required: true,
      description: 'Temperature value',
    },
    condition: {
      type: 'string',
      required: true,
      description: 'Weather condition (e.g., Sunny, Cloudy)',
    },
    humidity: {
      type: 'number',
      required: true,
      description: 'Humidity percentage',
    },
    units: {
      type: 'enum',
      required: true,
      enumValues: ['celsius', 'fahrenheit'],
      defaultValue: 'celsius',
      description: 'Temperature units',
    },
    updatedAt: {
      type: 'string',
      required: true,
      description: 'ISO timestamp of last update',
    },
  },
  metadata: {
    openai: {
      renderHints: {
        widgetAccessible: true,
      },
    },
  } as Partial<Record<ProviderName, ComponentMetadata>>,
});

// ============================================================================
// Register Tools
// ============================================================================

app.tool('get_weather', {
  title: 'Get Weather',
  description: 'Get current weather for a city',
  input: z.object({
    city: z.string().describe('City name'),
    units: z.enum(['celsius', 'fahrenheit']).default('celsius').describe('Temperature units'),
  }),
  handler: async ({ city, units }: { city: string; units?: 'celsius' | 'fahrenheit' }) => {
    const resolvedUnits = units ?? 'celsius';
    const data = await fetchWeather(city, resolvedUnits);

    return componentResponse(
      'weather-card',
      {
        city: data.city,
        temperature: data.temperature,
        condition: data.condition,
        humidity: data.humidity,
        units: resolvedUnits,
        updatedAt: data.updatedAt,
      } as Record<string, unknown>,
      \`Weather in \${city}: \${Math.round(data.temperature)}°\${resolvedUnits === 'celsius' ? 'C' : 'F'}, \${data.condition}\`
    );
  },
});

app.tool('search_cities', {
  title: 'Search Cities',
  description: 'Search for cities by name',
  input: z.object({
    query: z.string().describe('Search query'),
  }),
  handler: async ({ query }: { query: string }) => {
    const cities = [
      'New York',
      'London',
      'Tokyo',
      'Paris',
      'Sydney',
      'Berlin',
      'Toronto',
      'Mumbai',
      'Singapore',
      'Dubai',
    ].filter((candidate) => candidate.toLowerCase().includes(query.toLowerCase()));

    return textResponse(\`Found \${cities.length} cities matching "\${query}":\\n\${cities.join(', ')}\`);
  },
});

// ============================================================================
// Start Server
// ============================================================================

console.log('🌐 Weather App - Powered by Unido\\n');

await app.listen();

process.on('SIGINT', async () => {
  console.log('\\n\\n👋 Shutting down...');
  process.exit(0);
});

// Export app for widget development
export { app };
`;
}

// Removed: Multi-provider template is no longer supported.
// Unido is focused on OpenAI Apps only.
// Use getBasicTemplate() or getWeatherTemplate() instead.

export function getBasicComponentSource(): string {
  return `import { Card, CardContent, CardHeader, CardTitle } from '@bandofai/unido-components';
import { useToolOutput } from '@bandofai/unido-dev';
import type { FC } from 'react';

export interface GreetingCardProps {
  name: string;
  greeting: string;
}

const GreetingCard: FC<GreetingCardProps> = (props) => {
  // Get props from window.openai.toolOutput (for ChatGPT/MCP mode)
  // Falls back to React props for direct rendering
  const toolOutput = useToolOutput<GreetingCardProps>();
  const { name, greeting } = toolOutput || props;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{greeting}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Nice to meet you, {name}!</p>
      </CardContent>
    </Card>
  );
};

export default GreetingCard;
`;
}

export function getWeatherComponentSource(): string {
  return `import { useToolOutput } from '@bandofai/unido-dev';
import type { FC } from 'react';

export interface WeatherCardProps {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  units: 'celsius' | 'fahrenheit';
  updatedAt: string;
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

const WeatherCard: FC<WeatherCardProps> = (props) => {
  // Get props from window.openai.toolOutput (for ChatGPT/MCP mode)
  // Falls back to React props for direct rendering
  const toolOutput = useToolOutput<WeatherCardProps>();
  const { city, temperature, condition, humidity, units, updatedAt } = toolOutput || props;

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
      <div className={\`relative overflow-hidden rounded-[2rem] \${style.bgClass} shadow-[0_20px_60px_rgba(0,0,0,0.3)]\`}>
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
              <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Location">
                <title>Location</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-sm text-white drop-shadow-lg uppercase tracking-wider font-semibold">
                  {city}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white drop-shadow-md font-medium">
                {formattedTime}
              </p>
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
              <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
                {condition}
              </h2>
              <p className="text-sm text-white drop-shadow-md opacity-90">
                {formattedDate}
              </p>
            </div>

            {/* Weather Icon - Positioned on right */}
            <div className="flex-shrink-0 opacity-95 drop-shadow-2xl mt-4">
              {style.icon}
            </div>
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
`;
}

export function getEnvExample(): string {
  return `# OpenAI Provider Configuration
# Port for the MCP server (default: 3000)
UNIDO_OPENAI_PORT=3000

# Widget Development Configuration
# MCP server URL for testing widgets (default: http://localhost:3000)
# You can also change this in the widget dev server UI
UNIDO_MCP_SERVER_URL=http://localhost:3000
`;
}
