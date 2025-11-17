<div align="center">

<img src="../../docs/logo.png" alt="Unido Logo" width="150" />

# create-unido

**The fastest way to create a new Unido application.**

</div>

[![npm version](https://img.shields.io/npm/v/create-unido)](https://www.npmjs.com/package/create-unido)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## Quick Start

```bash
# Using pnpm (recommended)
pnpm create unido

# Using npm
npm create unido

# Using npx
npx create-unido
```

That's it! The CLI will guide you through creating your new Unido app.

---

## What You Get

The CLI scaffolds a complete Unido application with:

- ✅ **TypeScript configuration** - Strict mode, ES modules, proper paths
- ✅ **Build scripts** - dev, build, start commands ready to go
- ✅ **Example code** - Working tools based on your template choice
- ✅ **Git initialization** - Optional git repo setup
- ✅ **Dependency installation** - Auto-installs with your preferred package manager

---

## Usage

### Interactive Mode (Recommended)

Just run the command and answer the prompts:

```bash
pnpm create unido
```

You'll be asked:

1. **Project name** - Name of your application
2. **Template** - Choose from:
   - **Basic** - Simple starter with calculator and greet tools
   - **Weather** - Complete weather app example

### Non-Interactive Mode

Pass options via command line:

```bash
pnpm create unido my-app -t basic --skip-git --skip-install
```

#### Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--template <template>` | `-t` | Template to use (`basic` or `weather`) | prompt |
| `--skip-install` | | Skip dependency installation | `false` |
| `--skip-git` | | Skip git initialization | `false` |

---

## Templates

### Basic Template

Perfect for getting started. Includes:

- Simple greet tool
- Calculator tool with multiple operations
- Type-safe handlers with Zod
- OpenAI provider configuration

**Use when:** You want a minimal starting point to build your own tools.

```bash
pnpm create unido my-app -t basic
```

### Weather Template

A complete example application. Includes:

- Weather lookup tool
- City search tool
- Component responses
- External API integration patterns
- Error handling examples

**Use when:** You want to see a real-world example before building your own.

```bash
pnpm create unido weather-app -t weather
```

---

## What Happens During Setup

1. **Creates project directory**
   ```
   my-app/
   ├── src/
   │   └── index.ts       # Your application code
   ├── package.json
   ├── tsconfig.json
   ├── .gitignore
   └── README.md
   ```

2. **Installs dependencies**
   - `@bandofai/unido-core` - Core framework
   - `@bandofai/unido-provider-openai` - OpenAI adapter
   - `zod` - Schema validation
   - `typescript`, `tsx`, `@types/node` - Dev dependencies

3. **Initializes git** (unless `--skip-git`)
   - Creates `.git` directory
   - Makes initial commit

4. **Shows next steps**
   - How to start dev server
   - How to connect to ChatGPT
   - Links to documentation

---

## After Creation

### Start Development Server

```bash
cd my-app
pnpm run dev
```

Your server will start on `http://localhost:3000`.

### Connect to ChatGPT

1. Open ChatGPT
2. Go to **Settings → Custom Tools → Add Server**
3. Enter `http://localhost:3000`
4. Start chatting! ChatGPT can now use your tools.

### Build for Production

```bash
pnpm run build
pnpm start
```

---

## Manual Setup Alternative

If you prefer not to use the CLI, you can set up manually:

### 1. Create project

```bash
mkdir my-app && cd my-app
pnpm init
```

### 2. Install dependencies

```bash
pnpm add @bandofai/unido-core @bandofai/unido-provider-openai zod
pnpm add -D typescript @types/node tsx
```

### 3. Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### 4. Update package.json

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### 5. Create src/index.ts

```typescript
import { createApp, textResponse } from '@bandofai/unido-core';
import { openAI } from '@bandofai/unido-provider-openai';
import { z } from 'zod';

const app = createApp({
  name: 'my-app',
  version: '1.0.0',
  providers: {
    openai: openAI({ port: 3000 })
  }
});

app.tool('greet', {
  title: 'Greet User',
  description: 'Greet a user by name',
  input: z.object({
    name: z.string()
  }),
  handler: async ({ name }) => {
    return textResponse(`Hello, ${name}!`);
  }
});

await app.listen();
```

---

## Customization

### Change Port

Edit the port in your generated `src/index.ts`:

```typescript
providers: {
  openai: openAI({ port: 3001 })  // Changed from 3000
}
```

### Add More Tools

Add additional tools after the generated ones:

```typescript
app.tool('my_custom_tool', {
  title: 'My Custom Tool',
  description: 'Does something custom',
  input: z.object({
    param: z.string()
  }),
  handler: async ({ param }) => {
    return textResponse(`You said: ${param}`);
  }
});
```

---

## Troubleshooting

### "Command not found: create-unido"

Make sure you're using `pnpm create unido` (with space) not `pnpm create-unido`.

### Installation fails

Try running with verbose output:

```bash
pnpm create unido --verbose
```

Or skip installation and install manually:

```bash
pnpm create unido --skip-install
cd my-app
pnpm install
```

### "tsx: command not found"

Install tsx globally or run via npx:

```bash
pnpm add -g tsx
# or
npx tsx src/index.ts
```

### Port already in use

Change the port in your config or kill the process using port 3000:

```bash
# Find process
lsof -i :3000

# Kill it
kill -9 <PID>
```

---

## Package Manager Support

create-unido auto-detects your package manager:

- **pnpm** - Detected from `pnpm-lock.yaml` or `pnpm` in command
- **npm** - Used by default
- **yarn** - Detected from `yarn.lock`

Force a specific package manager:

```bash
npm create unido   # Forces npm
pnpm create unido  # Forces pnpm
yarn create unido  # Forces yarn
```

---

## Development

Want to contribute to the CLI? Here's how to set it up locally:

```bash
# Clone repo
git clone https://github.com/bandofai/unido.git
cd unido/packages/cli

# Install dependencies
pnpm install

# Build
pnpm run build

# Test locally
pnpm link --global
create-unido test-app
```

---

## Version History

### 0.2.6 (Latest)
- ✨ Use factory functions (openAI())
- 🐛 Fix TypeScript type errors in templates
- 📝 Better error messages

### 0.2.5
- 🔧 Update to @bandofai scoped packages
- ✅ All core packages published to npm

### 0.2.0
- 🎉 Initial public release
- ✨ Interactive CLI
- 📦 Basic and weather templates
- 🔧 Auto dependency installation

---

## Links

- **[Main Documentation](../../README.md)** - Unido framework docs
- **[npm Package](https://www.npmjs.com/package/create-unido)** - View on npm
- **[Report Issue](https://github.com/bandofai/unido/issues)** - Bug reports
- **[Examples](../../examples/)** - More example apps

---

## License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Built with ❤️ by the Unido team**
