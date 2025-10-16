/**
 * Project templates
 */

export function getPackageJson(projectName: string): Record<string, unknown> {
  return {
    name: projectName,
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
    },
    dependencies: {
      '@bandofai/unido-core': '^0.1.7',
      '@bandofai/unido-provider-openai': '^0.1.10',
      '@bandofai/unido-components': '^0.2.3',
      '@bandofai/unido-dev': '^0.1.5',
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

export function getReadme(projectName: string): string {
  return `# ${projectName}

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

### Local Development

For local development (testing on your machine only):

1. Make sure your development server is running
2. Open ChatGPT → Settings → Custom Tools
3. Click "Add Server"
4. Enter URL: http://localhost:3000
5. Start using your tools in ChatGPT!

## Build

\`\`\`bash
npm run build
npm start
\`\`\`

## Project Structure

\`\`\`
${projectName}/
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

export function getBasicTemplate(): string {
  return `import { existsSync } from 'node:fs';
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
  name: 'my-app',
  version: '1.0.0',
  providers: {
    openai: openAI({ port: 3000 })
  },
});

app.component({
  type: 'greeting-card',
  title: 'Greeting Card',
  description: 'Shows a personalized greeting message to the user.',
  sourcePath: greetingCardPath,
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

export function getWeatherTemplate(): string {
  return `import { existsSync } from 'node:fs';
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
  name: 'weather-app',
  version: '1.0.0',
  providers: {
    openai: openAI({ port: 3000 })
  },
});

app.component({
  type: 'weather-card',
  title: 'Weather Card',
  description: 'Displays a quick overview of the current weather for a city.',
  sourcePath: weatherCardPath,
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
  return `# Server Configuration
PORT=3000
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
