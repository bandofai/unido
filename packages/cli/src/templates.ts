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
  --gradient-sunny: linear-gradient(to bottom right, rgb(251 146 60), rgb(253 224 71), rgb(254 240 138));
  --gradient-clear: linear-gradient(to bottom right, rgb(96 165 250), rgb(147 197 253), rgb(254 240 138));
  --gradient-cloudy: linear-gradient(to bottom right, rgb(156 163 175), rgb(209 213 219), rgb(191 219 254));
  --gradient-partly-cloudy: linear-gradient(to bottom right, rgb(147 197 253), rgb(229 231 235), rgb(254 249 195));
  --gradient-rainy: linear-gradient(to bottom right, rgb(100 116 139), rgb(148 163 184), rgb(147 197 253));
  --gradient-snowy: linear-gradient(to bottom right, rgb(203 213 225), rgb(219 234 254), rgb(255 255 255));
  --gradient-default: linear-gradient(to bottom right, rgb(96 165 250), rgb(103 232 249), rgb(153 246 228));
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
  .text-white\\/70 { color: color-mix(in oklab, var(--color-white) 70%, transparent); }
  .text-white\\/80 { color: color-mix(in oklab, var(--color-white) 80%, transparent); }
  .text-white\\/90 { color: color-mix(in oklab, var(--color-white) 90%, transparent); }
  .bg-white\\/5 { background-color: color-mix(in oklab, var(--color-white) 5%, transparent); }
  .bg-white\\/10 { background-color: color-mix(in oklab, var(--color-white) 10%, transparent); }
  .border-white\\/20 { border-color: color-mix(in oklab, var(--color-white) 20%, transparent); }
  .text-yellow-300 { color: var(--color-yellow-300); }
  .text-yellow-400 { color: oklch(85.2% 0.199 91.936); }
  .text-gray-200 { color: var(--color-gray-200); }
  .text-gray-300 { color: var(--color-gray-300); }
  .text-blue-200 { color: var(--color-blue-200); }
  .text-blue-300 { color: var(--color-blue-300); }
  .text-blue-400 { color: var(--color-blue-400); }
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

const WeatherCard: FC<WeatherCardProps> = (props) => {
  // Get props from window.openai.toolOutput (for ChatGPT/MCP mode)
  // Falls back to React props for direct rendering
  const toolOutput = useToolOutput<WeatherCardProps>();
  const { city, temperature, condition, humidity, units, updatedAt } = toolOutput || props;

  const unitLabel = units === 'celsius' ? '°C' : '°F';
  const style = getWeatherStyle(condition);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Card with Gradient Background */}
      <div className={\`relative overflow-hidden rounded-3xl \${style.bgClass} shadow-2xl transition-all duration-500\`}>
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

