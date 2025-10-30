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
  .version('0.6.24')
  .argument('[project-name]', 'Name of the project to create')
  .option('-t, --template <template>', 'Template to use (basic, weather)')
  .option('--skip-install', 'Skip npm install')
  .option('--skip-git', 'Skip git initialization')
  .action(async (projectName, options) => {
    console.log(chalk.cyan.bold('\n🚀 Create Unido App\n'));

    let answers: {
      projectName: string;
      template: string;
      skipInstall: boolean;
      skipGit: boolean;
    };

    // Interactive prompts if options not provided
    if (!projectName || !options.template) {
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
              name: 'Basic - Minimal setup with example tools',
              value: 'basic',
            },
            {
              name: 'Weather - Complete weather app example',
              value: 'weather',
            },
          ],
          default: 'basic',
        });
      }

      const promptAnswers = await inquirer.prompt(prompts as any);

      answers = {
        projectName: projectName || promptAnswers.projectName,
        template: options.template || promptAnswers.template,
        skipInstall: options.skipInstall || false,
        skipGit: options.skipGit || false,
      };
    } else {
      answers = {
        projectName,
        template: options.template,
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
        console.log(chalk.white('  pnpm install  # Install dependencies'));
      }

      console.log(chalk.white('  pnpm run dev  # Start development server\n'));

      // OpenAI setup instructions
      console.log(chalk.yellow('📡 OpenAI ChatGPT Setup:'));
      console.log(chalk.white('  1. Server will run on http://localhost:3000'));
      console.log(chalk.white('  2. Add to ChatGPT: Settings → Custom Tools → Add Server\n'));

      console.log(chalk.cyan('📚 Documentation: https://github.com/bandofai/unido\n'));
    } catch (error) {
      console.error(chalk.red('\n❌ Error creating project:\n'));
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Widget development commands
const widget = program.command('widget').description('Widget development tools');

widget
  .command('dev')
  .description('Start widget development server with hot reload')
  .option('-p, --port <port>', 'Port for dev server', '5173')
  .action((options) => {
    console.log(chalk.cyan.bold('\n🎨 Widget Development Server\n'));
    console.log(chalk.yellow('⚠️  This command should be run from your project directory'));
    console.log(chalk.white('\nAdd to your project:\n'));
    console.log(chalk.cyan('  // src/widget-dev.ts'));
    console.log(chalk.white("  import { startWidgetServer } from '@bandofai/unido-dev';"));
    console.log(chalk.white("  import { app } from './index.js';\n"));
    console.log(chalk.white('  await startWidgetServer({'));
    console.log(chalk.white('    components: app.getComponents(),'));
    console.log(chalk.white(`    port: ${options.port},`));
    console.log(chalk.white('    open: true,'));
    console.log(chalk.white('  });\n'));
    console.log(chalk.white('Then run: pnpm run widget:dev\n'));
  });

widget
  .command('preview')
  .description('Preview widgets in browser')
  .action(() => {
    console.log(chalk.cyan.bold('\n👁️  Widget Preview\n'));
    console.log(chalk.yellow('Use the "widget dev" command for interactive preview'));
    console.log(
      chalk.white('Or add @bandofai/unido-dev to your project and call startWidgetServer()\n')
    );
  });

widget
  .command('gallery')
  .description('View all widgets in gallery mode')
  .action(() => {
    console.log(chalk.cyan.bold('\n🖼️  Widget Gallery\n'));
    console.log(chalk.yellow('Start widget dev server and switch to gallery mode'));
    console.log(chalk.white('Run: pnpm run widget:dev\n'));
  });

program.parse();
