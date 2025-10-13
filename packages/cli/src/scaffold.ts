/**
 * Project scaffolding logic
 */

import { exec } from 'node:child_process';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import chalk from 'chalk';
import {
  getBasicTemplate,
  getGitignore,
  getMultiProviderTemplate,
  getPackageJson,
  getReadme,
  getTsConfig,
  getWeatherTemplate,
} from './templates.js';

const execAsync = promisify(exec);

export interface ScaffoldOptions {
  projectName: string;
  template: string;
  provider: string;
  skipInstall: boolean;
  skipGit: boolean;
}

export async function scaffoldProject(options: ScaffoldOptions): Promise<void> {
  const { projectName, template, provider, skipInstall, skipGit } = options;

  console.log(chalk.blue(`\n📦 Creating project: ${projectName}\n`));

  // Check if directory already exists
  const projectPath = join(process.cwd(), projectName);
  try {
    await access(projectPath);
    throw new Error(`Directory "${projectName}" already exists`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  // Create project directory
  console.log(chalk.gray('  Creating directory...'));
  await mkdir(projectPath, { recursive: true });

  // Create src directory
  await mkdir(join(projectPath, 'src'));

  // Write package.json
  console.log(chalk.gray('  Writing package.json...'));
  const packageJson = getPackageJson(projectName, provider);
  await writeFile(join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));

  // Write tsconfig.json
  console.log(chalk.gray('  Writing tsconfig.json...'));
  const tsConfig = getTsConfig();
  await writeFile(join(projectPath, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));

  // Write .gitignore
  console.log(chalk.gray('  Writing .gitignore...'));
  const gitignore = getGitignore();
  await writeFile(join(projectPath, '.gitignore'), gitignore);

  // Write README.md
  console.log(chalk.gray('  Writing README.md...'));
  const readme = getReadme(projectName, provider);
  await writeFile(join(projectPath, 'README.md'), readme);

  // Write main application file based on template
  console.log(chalk.gray(`  Writing ${template} template...`));
  let appCode: string;

  switch (template) {
    case 'basic':
      appCode = getBasicTemplate(provider);
      break;
    case 'weather':
      appCode = getWeatherTemplate(provider);
      break;
    case 'multi-provider':
      appCode = getMultiProviderTemplate();
      break;
    default:
      appCode = getBasicTemplate(provider);
  }

  await writeFile(join(projectPath, 'src', 'index.ts'), appCode);

  // Initialize git repository
  if (!skipGit) {
    console.log(chalk.gray('  Initializing git repository...'));
    try {
      await execAsync('git init', { cwd: projectPath });
      await execAsync('git add .', { cwd: projectPath });
      await execAsync('git commit -m "Initial commit from create-unido"', {
        cwd: projectPath,
      });
    } catch {
      console.log(chalk.yellow('  ⚠️  Git initialization failed (optional)'));
    }
  }

  // Install dependencies
  if (!skipInstall) {
    console.log(chalk.gray('\n  Installing dependencies...\n'));
    try {
      // Detect package manager
      const packageManager = await detectPackageManager();
      console.log(chalk.blue(`  Using ${packageManager}...\n`));

      await execAsync(`${packageManager} install`, {
        cwd: projectPath,
      });
    } catch {
      console.log(chalk.yellow('\n  ⚠️  Installation failed. Run npm install manually.\n'));
    }
  }
}

async function detectPackageManager(): Promise<string> {
  // Check for pnpm
  try {
    await execAsync('pnpm --version');
    return 'pnpm';
  } catch {
    // pnpm not available
  }

  // Check for yarn
  try {
    await execAsync('yarn --version');
    return 'yarn';
  } catch {
    // yarn not available
  }

  // Default to npm
  return 'npm';
}
