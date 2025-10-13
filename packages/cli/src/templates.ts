/**
 * Project templates
 */

export function getPackageJson(projectName: string, provider: string): Record<string, unknown> {
  const dependencies: Record<string, string> = {
    '@bandofai/unido-core': '^0.1.0',
    'zod': '^3.24.1',
  };

  if (provider === 'openai' || provider === 'both') {
    dependencies['@bandofai/unido-provider-openai'] = '^0.1.0';
  }

  if (provider === 'claude' || provider === 'both') {
    dependencies['@bandofai/unido-provider-claude'] = '^0.1.0';
  }

  return {
    name: projectName,
    version: '1.0.0',
    type: 'module',
    description: 'Unido AI application',
    main: './dist/index.js',
    scripts: {
      build: 'tsc',
      dev: 'tsx src/index.ts',
      start: 'node dist/index.js',
      'type-check': 'tsc --noEmit',
    },
    dependencies,
    devDependencies: {
      '@types/node': '^22.10.7',
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
      lib: ['ES2022'],
      moduleResolution: 'bundler',
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

export function getReadme(projectName: string, provider: string): string {
  const providerSetup =
    provider === 'openai' || provider === 'both'
      ? `
## OpenAI ChatGPT Setup

1. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

2. The server will run on http://localhost:3000

3. Add to ChatGPT:
   - Go to ChatGPT Settings → Custom Tools
   - Click "Add Server"
   - Enter URL: http://localhost:3000
`
      : '';

  const claudeSetup =
    provider === 'claude' || provider === 'both'
      ? `
## Claude Desktop Setup

1. Build your application:
   \`\`\`bash
   npm run build
   \`\`\`

2. Configure Claude Desktop:
   Edit \`~/Library/Application Support/Claude/claude_desktop_config.json\`:
   \`\`\`json
   {
     "mcpServers": {
       "${projectName}": {
         "command": "node",
         "args": ["${process.cwd()}/${projectName}/dist/index.js"]
       }
     }
   }
   \`\`\`

3. Restart Claude Desktop
`
      : '';

  return `# ${projectName}

AI application built with [Unido](https://github.com/yourusername/unido) - a provider-agnostic framework for building AI applications.

## Features

- ✅ Provider-agnostic tool definitions
- ✅ Type-safe with TypeScript and Zod
- ✅ Works with OpenAI ChatGPT and Anthropic Claude
- ✅ Hot reload in development

## Installation

\`\`\`bash
npm install
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`
${providerSetup}${claudeSetup}

## Build

\`\`\`bash
npm run build
npm start
\`\`\`

## Project Structure

\`\`\`
${projectName}/
├── src/
│   └── index.ts       # Main application
├── dist/              # Build output
├── package.json
├── tsconfig.json
└── README.md
\`\`\`

## Learn More

- [Unido Documentation](https://github.com/yourusername/unido)
- [OpenAI Custom Tools](https://platform.openai.com/docs/guides/custom-tools)
- [Claude Desktop MCP](https://docs.anthropic.com/claude/docs/desktop-mcp)

## License

MIT
`;
}

export function getBasicTemplate(provider: string): string {
  const imports = [];
  imports.push(`import { createApp, textResponse } from '@bandofai/unido-core';`);

  if (provider === 'openai') {
    imports.push(`import { OpenAIAdapter } from '@bandofai/unido-provider-openai';`);
  } else if (provider === 'claude') {
    imports.push(`import { ClaudeAdapter } from '@bandofai/unido-provider-claude';`);
  } else {
    imports.push(`import { OpenAIAdapter } from '@bandofai/unido-provider-openai';`);
    imports.push(`import { ClaudeAdapter } from '@bandofai/unido-provider-claude';`);
  }

  imports.push(`import { z } from 'zod';`);

  const providerConfig =
    provider === 'both'
      ? `{
    openai: { enabled: true, port: 3000 },
    claude: { enabled: true }
  }`
      : provider === 'openai'
        ? `{
    openai: { enabled: true, port: 3000 }
  }`
        : `{
    claude: { enabled: true }
  }`;

  const adapterSetup =
    provider === 'both'
      ? `
// Register OpenAI adapter
const openaiAdapter = new OpenAIAdapter();
await openaiAdapter.initialize(app.getServerConfig());
app.registerProviderAdapter('openai', openaiAdapter);

// Register Claude adapter
const claudeAdapter = new ClaudeAdapter();
await claudeAdapter.initialize(app.getServerConfig());
app.registerProviderAdapter('claude', claudeAdapter);
`
      : provider === 'openai'
        ? `
// Register OpenAI adapter
const adapter = new OpenAIAdapter();
await adapter.initialize(app.getServerConfig());
app.registerProviderAdapter('openai', adapter);
`
        : `
// Register Claude adapter
const adapter = new ClaudeAdapter();
await adapter.initialize(app.getServerConfig());
app.registerProviderAdapter('claude', adapter);
`;

  return `${imports.join('\n')}

// ============================================================================
// Create Unido App
// ============================================================================

const app = createApp({
  name: 'my-app',
  version: '1.0.0',
  providers: ${providerConfig},
});
${adapterSetup}
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
    return textResponse(\`Hello, \${name}! Welcome to Unido.\`);
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

// Keep process alive
process.on('SIGINT', async () => {
  console.log('\\n\\n👋 Shutting down...');
  process.exit(0);
});
`;
}

export function getWeatherTemplate(provider: string): string {
  const imports = [];
  imports.push(`import { createApp, textResponse, componentResponse } from '@bandofai/unido-core';`);

  if (provider === 'openai' || provider === 'both') {
    imports.push(`import { OpenAIAdapter } from '@bandofai/unido-provider-openai';`);
  }
  if (provider === 'claude' || provider === 'both') {
    imports.push(`import { ClaudeAdapter } from '@bandofai/unido-provider-claude';`);
  }

  imports.push(`import { z } from 'zod';`);

  const providerConfig =
    provider === 'both'
      ? `{
    openai: { enabled: true, port: 3000 },
    claude: { enabled: true }
  }`
      : provider === 'openai'
        ? '{ openai: { enabled: true, port: 3000 } }'
        : '{ claude: { enabled: true } }';

  const adapterSetup =
    provider === 'both'
      ? `
const openaiAdapter = new OpenAIAdapter();
await openaiAdapter.initialize(app.getServerConfig());
app.registerProviderAdapter('openai', openaiAdapter);

const claudeAdapter = new ClaudeAdapter();
await claudeAdapter.initialize(app.getServerConfig());
app.registerProviderAdapter('claude', claudeAdapter);
`
      : provider === 'openai'
        ? `
const adapter = new OpenAIAdapter();
await adapter.initialize(app.getServerConfig());
app.registerProviderAdapter('openai', adapter);
`
        : `
const adapter = new ClaudeAdapter();
await adapter.initialize(app.getServerConfig());
app.registerProviderAdapter('claude', adapter);
`;

  return `${imports.join('\n')}

// ============================================================================
// Mock Weather API
// ============================================================================

interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  units: 'celsius' | 'fahrenheit';
}

async function fetchWeather(
  city: string,
  units: 'celsius' | 'fahrenheit'
): Promise<WeatherData> {
  // Mock data - replace with real API call
  const baseTemp = units === 'celsius' ? 22 : 72;

  return {
    city,
    temperature: baseTemp + Math.random() * 10,
    condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][
      Math.floor(Math.random() * 4)
    ]!,
    humidity: 60 + Math.random() * 30,
    units,
  };
}

// ============================================================================
// Create Unido App
// ============================================================================

const app = createApp({
  name: 'weather-app',
  version: '1.0.0',
  providers: ${providerConfig},
});
${adapterSetup}
// ============================================================================
// Register Tools
// ============================================================================

app.tool('get_weather', {
  title: 'Get Weather',
  description: 'Get current weather for a city',
  input: z.object({
    city: z.string().describe('City name'),
    units: z
      .enum(['celsius', 'fahrenheit'])
      .default('celsius')
      .describe('Temperature units'),
  }),
  handler: async ({ city, units }: { city: string; units?: 'celsius' | 'fahrenheit' }) => {
    const data = await fetchWeather(city, units ?? 'celsius');

    return componentResponse(
      'weather-card',
      data as unknown as Record<string, unknown>,
      \`Weather in \${city}: \${Math.round(data.temperature)}°\${units === 'celsius' ? 'C' : 'F'}, \${data.condition}\`
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
      'New York', 'London', 'Tokyo', 'Paris', 'Sydney',
      'Berlin', 'Toronto', 'Mumbai', 'Singapore', 'Dubai'
    ].filter((city) => city.toLowerCase().includes(query.toLowerCase()));

    return textResponse(
      \`Found \${cities.length} cities matching "\${query}":\\n\${cities.join(', ')}\`
    );
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

export function getMultiProviderTemplate(): string {
  return `import { createApp, textResponse } from '@bandofai/unido-core';
import { OpenAIAdapter } from '@bandofai/unido-provider-openai';
import { ClaudeAdapter } from '@bandofai/unido-provider-claude';
import { z } from 'zod';

// ============================================================================
// Create Unido App with Multiple Providers
// ============================================================================

const app = createApp({
  name: 'multi-provider-app',
  version: '1.0.0',
  providers: {
    openai: {
      enabled: true,
      port: 3000,
      transport: 'http',
    },
    claude: {
      enabled: true,
    },
  },
});

// Register OpenAI adapter
const openaiAdapter = new OpenAIAdapter();
await openaiAdapter.initialize(app.getServerConfig());
app.registerProviderAdapter('openai', openaiAdapter);

// Register Claude adapter
const claudeAdapter = new ClaudeAdapter();
await claudeAdapter.initialize(app.getServerConfig());
app.registerProviderAdapter('claude', claudeAdapter);

// ============================================================================
// Register Tools (Work with Both Providers!)
// ============================================================================

app.tool('echo', {
  title: 'Echo',
  description: 'Echo back the input message',
  input: z.object({
    message: z.string().describe('Message to echo'),
  }),
  handler: async ({ message }, context) => {
    return textResponse(
      \`[\${context.provider.toUpperCase()}] Echo: \${message}\`
    );
  },
});

app.tool('provider_info', {
  title: 'Provider Info',
  description: 'Get information about the current provider',
  input: z.object({}),
  handler: async (_input, context) => {
    const info = {
      openai: {
        name: 'OpenAI ChatGPT',
        transport: 'HTTP + SSE',
        url: 'http://localhost:3000',
      },
      claude: {
        name: 'Anthropic Claude Desktop',
        transport: 'stdio',
        url: 'N/A (local)',
      },
    };

    const current = info[context.provider as 'openai' | 'claude'] || { name: 'Unknown' };

    return textResponse(
      \`Provider: \${current.name}\\nTransport: \${current.transport}\\nEndpoint: \${current.url}\`
    );
  },
});

// ============================================================================
// Start Server
// ============================================================================

console.log('🚀 Multi-Provider App - Powered by Unido\\n');

await app.listen();

console.log('✅ Server started!');
console.log('   OpenAI: http://localhost:3000');
console.log('   Claude: stdio (via Claude Desktop)\\n');

process.on('SIGINT', async () => {
  console.log('\\n\\n👋 Shutting down...');
  process.exit(0);
});
`;
}
