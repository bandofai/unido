/**
 * Widget development server
 * Run with: pnpm run widget:dev
 */

import { startWidgetServer } from '@unido/dev';
import { app } from './index.js';

async function main() {
  console.log('🎨 Starting widget development server...\n');

  const server = await startWidgetServer({
    components: app.getComponents(),
    port: 5173,
    open: false, // Don't auto-open in test
    verbose: true,
  });

  console.log(`✅ Widget preview running at ${server.url}\n`);
  console.log('Features:');
  console.log('  🔥 Hot Module Replacement (HMR)');
  console.log('  🎯 Interactive prop editor');
  console.log('  🖼️  Gallery view for all components');
  console.log('  ⚠️  Error boundaries with helpful messages\n');
  console.log('Press Ctrl+C to stop\n');

  // Keep running
  process.on('SIGINT', async () => {
    console.log('\n\n👋 Shutting down widget server...');
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Failed to start widget server:', error);
  process.exit(1);
});
