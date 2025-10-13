#!/usr/bin/env node

/**
 * create-unido CLI
 * Interactive scaffolding tool for Unido projects
 */

import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { scaffoldProject } from './scaffold.js';
import { validateProjectName } from './utils.js';

const program = new Command();

program
  .name('create-unido')
  .description('Create a new Unido AI application')
  .version('0.2.0')
  .argument('[project-name]', 'Name of the project to create')
  .option('-t, --template <template>', 'Template to use (basic, weather, multi-provider)')
  .option('-p, --provider <provider>', 'AI provider (openai, claude, both)')
  .option('--skip-install', 'Skip npm install')
  .option('--skip-git', 'Skip git initialization')
  .action(async (projectName, options) => {
    console.log(chalk.cyan.bold('\n🚀 Create Unido App\n'));

    let answers: {
      projectName: string;
      template: string;
      provider: string;
      skipInstall: boolean;
      skipGit: boolean;
    };

    // Interactive prompts if options not provided
    if (!projectName || !options.template || !options.provider) {
      const prompts = [];

      if (!projectName) {
        prompts.push({
          type: 'input',
          name: 'projectName',
          message: 'Project name:',
          default: 'my-unido-app',
          validate: (input: string) => {
            const validation = validateProjectName(input);
            return validation.valid || validation.error || 'Invalid project name';
          },
        });
      }

      if (!options.template) {
        prompts.push({
          type: 'list',
          name: 'template',
          message: 'Select a template:',
          choices: [
            {
              name: 'Basic - Minimal setup with one tool',
              value: 'basic',
            },
            {
              name: 'Weather - Complete weather app example',
              value: 'weather',
            },
            {
              name: 'Multi-Provider - OpenAI + Claude setup',
              value: 'multi-provider',
            },
          ],
          default: 'basic',
        });
      }

      if (!options.provider) {
        prompts.push({
          type: 'list',
          name: 'provider',
          message: 'Select AI provider:',
          choices: [
            {
              name: 'OpenAI ChatGPT - HTTP + SSE transport',
              value: 'openai',
            },
            {
              name: 'Anthropic Claude - stdio transport',
              value: 'claude',
            },
            {
              name: 'Both - Multi-provider setup',
              value: 'both',
            },
          ],
          default: 'openai',
        });
      }

      const promptAnswers = await inquirer.prompt(prompts as any);

      answers = {
        projectName: projectName || promptAnswers.projectName,
        template: options.template || promptAnswers.template,
        provider: options.provider || promptAnswers.provider,
        skipInstall: options.skipInstall || false,
        skipGit: options.skipGit || false,
      };
    } else {
      answers = {
        projectName,
        template: options.template,
        provider: options.provider,
        skipInstall: options.skipInstall || false,
        skipGit: options.skipGit || false,
      };
    }

    // Validate project name
    const validation = validateProjectName(answers.projectName);
    if (!validation.valid) {
      console.error(chalk.red(`\n❌ Error: ${validation.error}\n`));
      process.exit(1);
    }

    // Scaffold the project
    try {
      await scaffoldProject(answers);

      console.log(chalk.green.bold('\n✅ Project created successfully!\n'));
      console.log(chalk.cyan('Next steps:\n'));
      console.log(chalk.white(`  cd ${answers.projectName}`));

      if (answers.skipInstall) {
        console.log(chalk.white('  npm install'));
      }

      console.log(chalk.white('  npm run dev\n'));

      // Provider-specific instructions
      if (answers.provider === 'openai' || answers.provider === 'both') {
        console.log(chalk.yellow('📡 OpenAI Setup:'));
        console.log(chalk.white('  1. Server will run on http://localhost:3000'));
        console.log(chalk.white('  2. Add to ChatGPT: Settings → Custom Tools → Add Server\n'));
      }

      if (answers.provider === 'claude' || answers.provider === 'both') {
        console.log(chalk.yellow('🤖 Claude Desktop Setup:'));
        console.log(
          chalk.white('  1. Edit: ~/Library/Application Support/Claude/claude_desktop_config.json')
        );
        console.log(chalk.white('  2. Add your app to "mcpServers"'));
        console.log(chalk.white('  3. Restart Claude Desktop\n'));
      }

      console.log(chalk.cyan('📚 Documentation: https://github.com/yourusername/unido\n'));
    } catch (error) {
      console.error(chalk.red('\n❌ Error creating project:\n'));
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();
