/**
 * Project scaffolding logic
 */

import { exec } from 'node:child_process';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import chalk from 'chalk';
import {
  getBasicComponentSource,
  getBasicTemplate,
  getEnvExample,
  getGitignore,
  getNpmrc,
  getPackageJson,
  getReadme,
  getTsConfig,
  getTunnelScript,
  getWeatherComponentSource,
  getWeatherTemplate,
  getWidgetDevScript,
} from './templates.js';

const execAsync = promisify(exec);

function stringifyJson(value: unknown): string {
  const json = JSON.stringify(value, null, 2);

  return json.replace(/\[\n((?:\s{2,}"[^"]+"(?:,\n)?)+)\n(\s{2,})\]/g, (_match, items: string) => {
    const compactItems = items
      .split('\n')
      .map((line: string) => line.trim().replace(/,$/, '')) // Remove trailing commas before joining
      .filter(Boolean)
      .join(', ');

    return `[${compactItems}]`;
  });
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${stringifyJson(value)}\n`);
}

export interface ScaffoldOptions {
  projectName: string;
  template: string;
  skipInstall: boolean;
  skipGit: boolean;
}

export async function scaffoldProject(options: ScaffoldOptions): Promise<void> {
  const { projectName, template, skipInstall, skipGit } = options;

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

  // Create src and scripts directories
  await mkdir(join(projectPath, 'src'));
  await mkdir(join(projectPath, 'src', 'components'));
  await mkdir(join(projectPath, 'scripts'));

  // Write package.json
  console.log(chalk.gray('  Writing package.json...'));
  const packageJson = getPackageJson(projectName);
  await writeJsonFile(join(projectPath, 'package.json'), packageJson);

  // Write tsconfig.json
  console.log(chalk.gray('  Writing tsconfig.json...'));
  const tsConfig = getTsConfig();
  await writeJsonFile(join(projectPath, 'tsconfig.json'), tsConfig);

  // Write .gitignore
  console.log(chalk.gray('  Writing .gitignore...'));
  const gitignore = getGitignore();
  await writeFile(join(projectPath, '.gitignore'), gitignore);

  // Write .npmrc
  console.log(chalk.gray('  Writing .npmrc...'));
  const npmrc = getNpmrc();
  await writeFile(join(projectPath, '.npmrc'), npmrc);

  // Write README.md
  console.log(chalk.gray('  Writing README.md...'));
  const readme = getReadme(projectName);
  await writeFile(join(projectPath, 'README.md'), readme);

  // Write .env.example
  console.log(chalk.gray('  Writing .env.example...'));
  const envExample = getEnvExample();
  await writeFile(join(projectPath, '.env.example'), envExample);

  // Write tunnel script
  console.log(chalk.gray('  Writing scripts/tunnel.ts...'));
  const tunnelScript = getTunnelScript();
  await writeFile(join(projectPath, 'scripts', 'tunnel.ts'), tunnelScript);

  // Write widget dev script
  console.log(chalk.gray('  Writing src/widget-dev.ts...'));
  const widgetDevScript = getWidgetDevScript();
  await writeFile(join(projectPath, 'src', 'widget-dev.ts'), widgetDevScript);

  // Write main application file based on template
  console.log(chalk.gray(`  Writing ${template} template...`));
  let appCode: string;
  const componentFiles: Array<{ name: string; contents: string }> = [];

  switch (template) {
    case 'basic':
      appCode = getBasicTemplate();
      componentFiles.push({ name: 'GreetingCard.tsx', contents: getBasicComponentSource() });
      break;
    case 'weather':
      appCode = getWeatherTemplate();
      componentFiles.push({ name: 'WeatherCard.tsx', contents: getWeatherComponentSource() });
      break;
    default:
      appCode = getBasicTemplate();
      componentFiles.push({ name: 'GreetingCard.tsx', contents: getBasicComponentSource() });
  }

  await writeFile(join(projectPath, 'src', 'index.ts'), appCode);

  for (const file of componentFiles) {
    await writeFile(join(projectPath, 'src', 'components', file.name), file.contents);
  }

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
    let packageManager = 'pnpm';
    try {
      // Detect package manager
      packageManager = await detectPackageManager();
      console.log(chalk.blue(`  Using ${packageManager}...\n`));

      const installCommand =
        packageManager === 'pnpm'
          ? `${packageManager} install --ignore-workspace`
          : `${packageManager} install`;

      const { stdout, stderr } = await execAsync(installCommand, {
        cwd: projectPath,
        env: { ...process.env, PNPM_HOME: projectPath },
      });

      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);

      console.log(chalk.green('\n  ✅ Dependencies installed successfully!\n'));
    } catch (error) {
      console.log(
        chalk.yellow('\n  ⚠️  Installation failed. Please run the following command manually:\n')
      );
      const suggestedCommand =
        packageManager === 'pnpm'
          ? `cd ${projectName} && pnpm install --ignore-workspace`
          : `cd ${projectName} && ${packageManager} install`;
      console.log(chalk.white(`    ${suggestedCommand}\n`));
      if (error instanceof Error) {
        console.log(chalk.gray(`  Error: ${error.message}\n`));
      }
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
