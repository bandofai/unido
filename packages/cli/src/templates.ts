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
      inspect: 'npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse --method tools/list',
      tunnel: 'node --import tsx scripts/tunnel.ts',
    },
    dependencies: {
      '@bandofai/unido-core': '^0.1.4',
      '@bandofai/unido-provider-openai': '^0.1.6',
      '@bandofai/unido-components': '^0.2.1',
      'react': '^18.3.1',
      'react-dom': '^18.3.1',
      'zod': '^3.24.1',
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

### Public Access with Cloudflare Tunnel (HTTPS)

To expose your server publicly with HTTPS (for ChatGPT access from anywhere):

1. **Install cloudflared (one-time setup):**
   \`\`\`bash
   # macOS
   brew install cloudflare/cloudflare/cloudflared

   # Or download from: https://github.com/cloudflare/cloudflared/releases
   \`\`\`

2. **Start your server:**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **In a new terminal, start the Cloudflare Tunnel:**
   \`\`\`bash
   npm run tunnel
   \`\`\`

   This will output:
   \`\`\`
   ☁️  Starting Cloudflare Tunnel...
   ✅ Tunnel started successfully!
   📡 Public URL: https://random-name.trycloudflare.com
   \`\`\`

4. **Configure ChatGPT:**
   - Open ChatGPT → Settings → Custom Tools
   - Add Server with the URL shown (e.g., \`https://random-name.trycloudflare.com\`)
   - Your MCP server is now accessible via HTTPS!

**Benefits:**
- ✅ **No account needed** - works instantly
- ✅ **Free HTTPS tunnel** - no limits or trials
- ✅ **Fast & reliable** - powered by Cloudflare's network
- ⚠️ **URL changes** - each restart gets a new random URL

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

export function getTunnelScript(): string {
  return `#!/usr/bin/env node
import { spawn } from 'node:child_process';

const PORT = process.env.PORT || 3000;

async function startTunnel() {
  try {
    console.log('☁️  Starting Cloudflare Tunnel...\\n');
    console.log(\`🔌 Connecting to http://localhost:\${PORT}...\\n\`);

    // Start cloudflared tunnel using system binary
    // Use --no-autoupdate to skip cert check for quick tunnels
    const child = spawn('cloudflared', ['tunnel', '--url', \`http://localhost:\${PORT}\`, '--no-autoupdate'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let url: string | null = null;
    let isShuttingDown = false;

    // Parse both stdout and stderr for the tunnel URL
    const parseOutput = (data: Buffer) => {
      const output = data.toString();

      // Look for the tunnel URL in the output
      const urlMatch = output.match(/https:\\/\\/[^\\s]+\\.trycloudflare\\.com/);
      if (urlMatch && !url) {
        url = urlMatch[0];
        console.log('✅ Tunnel started successfully!\\n');
        console.log(\`📡 Public URL: \${url}\`);
        console.log(\`🔗 Local URL:  http://localhost:\${PORT}\\n\`);
        console.log('To configure ChatGPT:');
        console.log(\`  1. Go to Settings → Custom Tools\`);
        console.log(\`  2. Add Server: \${url}\\n\`);
        console.log('Press Ctrl+C to stop the tunnel\\n');
      }
    };

    child.stdout.on('data', parseOutput);
    child.stderr.on('data', parseOutput);

    // Handle process exit
    child.on('exit', (code) => {
      if (!isShuttingDown) {
        console.error(\`\\n❌ Tunnel process exited unexpectedly with code \${code}\`);
        process.exit(code || 1);
      }
    });

    // Handle shutdown gracefully
    const shutdown = () => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      console.log('\\n\\n👋 Stopping tunnel...');
      child.kill('SIGTERM');
      setTimeout(() => {
        child.kill('SIGKILL');
        process.exit(0);
      }, 1000);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error: any) {
    console.error('\\n❌ Failed to start tunnel\\n');

    if (error.message) {
      console.error(\`Error: \${error.message}\\n\`);
    }

    console.error('Common solutions:');
    console.error(\`  1. Make sure your server is running on port \${PORT}\`);
    console.error('  2. Check your internet connection');
    console.error('  3. Make sure cloudflared is installed: brew install cloudflare/cloudflare/cloudflared\\n');

    if (error.code === 'ENOENT') {
      console.error('💡 cloudflared not found. Install it with:');
      console.error('   brew install cloudflare/cloudflare/cloudflared\\n');
    }

    process.exit(1);
  }
}

startTunnel();
`;
}

export function getEnvExample(): string {
  return `# Server Configuration
PORT=3000
`;
}
