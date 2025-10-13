# Gemini Code-along Agent Context

This document provides context for the Gemini code-along agent to understand the project structure, conventions, and goals.

## Project Overview

This project, "Unido," is a provider-agnostic TypeScript framework for building AI applications. The goal is to "write once, run everywhere," allowing applications to work seamlessly across different AI platforms like OpenAI, Anthropic Claude, and Google Gemini.

The project is a monorepo managed with pnpm and Turborepo. The main packages are:

*   `@unido/core`: The core framework, including the main `createApp` API, tool and component systems, and type definitions.
*   `@unido/provider-base`: Defines the base `ProviderAdapter` interface for all providers.
*   `@unido/provider-openai`: The provider for OpenAI.
*   `@unido/provider-claude`: The provider for Anthropic Claude.

The architecture is based on a provider abstraction layer, where each provider implements the `ProviderAdapter` interface. This allows for a universal tool system and a component system that can adapt to the capabilities of each provider.

## Building and Running

The following commands are used to build, run, and test the project:

*   **Install dependencies:** `pnpm install`
*   **Build all packages:** `pnpm run build`
*   **Run in development mode:** `pnpm run dev`
*   **Run tests:** `pnpm run test`
*   **Type check:** `pnpm run type-check`
*   **Lint:** `pnpm run lint`
*   **Fix linting issues:** `pnpm run lint:fix`
*   **Format files:** `pnpm run format`
*   **Check formatting:** `pnpm run format:check`

## Development Conventions

*   **Coding Style:** The project uses Biome for linting and formatting. The configuration is in `biome.json`.
*   **Testing:** The project uses Vitest for testing. Test files are located next to the source files and have the `.test.ts` extension.
*   **Commits:** (Inferring from common practice, but not explicitly stated) Commit messages should follow the Conventional Commits specification.
*   **TypeScript:** The project uses TypeScript with strict mode enabled. Path aliases are used for cleaner imports (e.g., `@unido/core` instead of relative paths).
*   **Schema:** Zod is used for schema definition and validation.
