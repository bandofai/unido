/**
 * MCP Client Usage Example
 *
 * This example demonstrates how to use the McpWidgetClient to:
 * - Connect to an MCP server
 * - List available widgets
 * - Load widget HTML
 * - Execute tool calls
 */

import { McpWidgetClient } from '@bandofai/unido-dev';

async function main() {
  // Create client instance
  const client = new McpWidgetClient({
    serverUrl: 'http://localhost:3000',
    timeout: 10000,
    autoReconnect: true,
    maxReconnectAttempts: 3,
    reconnectDelay: 1000,
    debug: true, // Enable debug logging
  });

  try {
    // Connect to the MCP server
    console.log('Connecting to MCP server...');
    await client.connect();
    console.log('Connected!');
    console.log('Connection state:', client.getConnectionState());

    // List available widgets
    console.log('\n--- Listing Widgets ---');
    const widgets = await client.listWidgets();
    console.log(`Found ${widgets.length} widgets:`);
    for (const widget of widgets) {
      console.log(`  - ${widget.type}: ${widget.title}`);
      console.log(`    URI: ${widget.uri}`);
      if (widget.description) {
        console.log(`    Description: ${widget.description}`);
      }
    }

    // Load a specific widget (if available)
    if (widgets.length > 0) {
      const firstWidget = widgets[0];
      if (firstWidget) {
        console.log(`\n--- Loading Widget: ${firstWidget.type} ---`);
        const html = await client.loadWidget(firstWidget.type);
        console.log(`Widget HTML length: ${html.length} bytes`);
        console.log('First 200 characters:');
        console.log(html.substring(0, 200));

        // Load again (should use cache)
        console.log('\n--- Loading Widget Again (from cache) ---');
        const htmlCached = await client.loadWidget(firstWidget.type);
        console.log(`Widget HTML length: ${htmlCached.length} bytes (cached)`);
      }
    }

    // Example tool call (if your server has a tool)
    console.log('\n--- Tool Call Example ---');
    try {
      const toolResult = await client.callTool('get_weather', {
        city: 'Portland',
      });
      console.log('Tool result:', toolResult);
    } catch (error) {
      console.log('Tool call failed (this is expected if tool does not exist):', error);
    }

    // Clear cache
    console.log('\n--- Clearing Cache ---');
    client.clearCache();
    console.log('Cache cleared');

    // Disconnect
    console.log('\n--- Disconnecting ---');
    await client.disconnect();
    console.log('Disconnected!');
    console.log('Connection state:', client.getConnectionState());
  } catch (error) {
    console.error('Error:', error);
    await client.disconnect();
    process.exit(1);
  }
}

// Run the example
main().catch(console.error);
