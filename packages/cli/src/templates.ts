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
      'widget:dev': 'node --import tsx src/widget-dev.ts',
      inspect:
        'npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse --method tools/list',
      tunnel: 'ngrok http 3000',
    },
    dependencies: {
      '@bandofai/unido-core': '^0.1.12',
      '@bandofai/unido-provider-openai': '^0.1.19',
      '@bandofai/unido-components': '^0.2.8',
      '@bandofai/unido-dev': '^0.1.13',
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
    openai: openAI({ port: Number(process.env.UNIDO_OPENAI_PORT) || 3000 })
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
    openai: openAI({ port: Number(process.env.UNIDO_OPENAI_PORT) || 3000 })
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
import type { FC } from 'react';

export interface GreetingCardProps {
  name: string;
  greeting: string;
}

const GreetingCard: FC<GreetingCardProps> = ({ name, greeting }) => (
  <Card>
    <CardHeader>
      <CardTitle>{greeting}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Nice to meet you, {name}!</p>
    </CardContent>
  </Card>
);

export default GreetingCard;
`;
}

export function getWeatherComponentSource(): string {
  return `import {
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
  updatedAt: string;
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
          Updated {new Date(updatedAt).toLocaleTimeString()}
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
`;
}


export function getEnvExample(): string {
  return `# OpenAI Provider Configuration
# Port for the MCP server (default: 3000)
UNIDO_OPENAI_PORT=3000
`;
}

export function getWidgetDevScript(): string {
  return `/**
 * Widget development server
 * Run with: pnpm run widget:dev
 */

import { startWidgetServer } from '@bandofai/unido-dev';
import { app } from './index.js';

async function main() {
  console.log('🎨 Starting widget development server...\\n');

  const server = await startWidgetServer({
    components: app.getComponents(),
    port: 5173,
    open: true,
    verbose: true,
  });

  console.log(\`✅ Widget preview running at \${server.url}\\n\`);
  console.log('Features:');
  console.log('  🔥 Hot Module Replacement (HMR)');
  console.log('  🎯 Interactive prop editor');
  console.log('  🖼️  Gallery view for all components');
  console.log('  ⚠️  Error boundaries with helpful messages\\n');
  console.log('Press Ctrl+C to stop\\n');
}

main().catch((error) => {
  console.error('Failed to start widget server:', error);
  process.exit(1);
});
`;
}
