# create-unido

Official CLI tool for scaffolding [Unido](https://github.com/yourusername/unido) projects.

## Usage

The easiest way to create a new Unido project is to use `pnpm create`, `npm create`, or `npx`:

```bash
# With pnpm (recommended)
pnpm create unido

# With npm
npm create unido

# With npx
npx create-unido

# With yarn
yarn create unido
```

### Interactive Mode (Recommended)

Simply run the command without arguments for an interactive setup:

```bash
pnpm create unido
```

The CLI will prompt you for:
- Project name
- Template selection (basic or weather)

**Note:** All projects use OpenAI ChatGPT as the AI provider.

### Non-Interactive Mode

```bash
pnpm create unido my-app --template basic
```

### Options

```
Options:
  -V, --version              output the version number
  -t, --template <template>  Template to use (basic, weather)
  --skip-install             Skip npm install
  --skip-git                 Skip git initialization
  -h, --help                 display help for command
```

## Templates

### 1. Basic Template

Minimal setup with example tools:
- Greet tool - Simple greeting function
- Calculate tool - Basic arithmetic operations

```bash
pnpm create unido my-app --template basic --provider openai
```

### 2. Weather Template

Complete weather application example:
- Get weather tool - Fetch weather data
- Search cities tool - Find cities by name
- Component responses - UI-enhanced output

```bash
pnpm create unido weather-app --template weather --provider claude
```

### 3. Multi-Provider Template

Advanced setup with both OpenAI and Claude:
- Echo tool - Test tool for both providers
- Provider info tool - Shows current provider details
- Demonstrates multi-provider architecture

```bash
pnpm create unido multi-app --template multi-provider
```

## Provider Options

### OpenAI ChatGPT

Uses HTTP + SSE transport for real-time communication:

```bash
pnpm create unido my-app --provider openai
```

**Setup**:
1. Run `npm run dev`
2. Server starts on http://localhost:3000
3. Add to ChatGPT: Settings → Custom Tools → Add Server

### Anthropic Claude Desktop

Uses stdio transport for local communication:

```bash
pnpm create unido my-app --provider claude
```

**Setup**:
1. Build app: `npm run build`
2. Edit `~/Library/Application Support/Claude/claude_desktop_config.json`
3. Add your app to `mcpServers`
4. Restart Claude Desktop

### Both Providers

Create an app that works with both:

```bash
pnpm create unido my-app --provider both
```

## Examples

### Quick Start

```bash
# Interactive
pnpm create unido

# Basic OpenAI app
pnpm create unido my-openai-app --template basic --provider openai

# Weather app for Claude
pnpm create unido weather-claude --template weather --provider claude

# Multi-provider setup
pnpm create unido universal-app --template multi-provider
```

### Skip Installation

```bash
pnpm create unido my-app --skip-install
cd my-app
npm install
```

### Skip Git

```bash
pnpm create unido my-app --skip-git
```

## Generated Project Structure

```
my-app/
├── src/
│   └── index.ts          # Main application
├── dist/                 # Build output
├── node_modules/
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Development Workflow

After creating your project:

```bash
cd my-app

# Development with hot reload
npm run dev

# Build for production
npm run build

# Run built application
npm start

# Type checking
npm run type-check
```

## Dependencies

The CLI will install appropriate dependencies based on your provider selection:

### All Projects
- `@unido/core` - Core framework
- `zod` - Schema validation
- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution for development

### OpenAI Projects
- `@unido/provider-openai` - OpenAI adapter with HTTP + SSE

### Claude Projects
- `@unido/provider-claude` - Claude adapter with stdio

## Troubleshooting

### "command not found: create-unido"

Make sure you're using `npx`:
```bash
npx create-unido my-app
```

### "Directory already exists"

Choose a different project name or remove the existing directory:
```bash
rm -rf my-app
npx create-unido my-app
```

### Installation fails

Use `--skip-install` and install manually:
```bash
npx create-unido my-app --skip-install
cd my-app
npm install
```

### Port 3000 already in use (OpenAI)

Edit `src/index.ts` and change the port:
```typescript
providers: {
  openai: { enabled: true, port: 3001 } // Changed from 3000
}
```

## Requirements

- Node.js >= 18.0.0
- npm, pnpm, or yarn

## Learn More

- [Unido Documentation](https://github.com/yourusername/unido)
- [OpenAI Custom Tools](https://platform.openai.com/docs/guides/custom-tools)
- [Claude Desktop MCP](https://docs.anthropic.com/claude/docs/desktop-mcp)

## License

MIT
