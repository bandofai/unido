/**
 * HTTP Server with SSE for OpenAI MCP
 * Implements Express server with Server-Sent Events transport
 */

import type { Server as HttpServer } from 'node:http';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import cors from 'cors';
import express, { type Application, type Request, type Response } from 'express';

// ============================================================================
// Types
// ============================================================================

export interface ServerOptions {
  port: number;
  host?: string;
  cors?: boolean;
}

export interface OpenAIHttpServer {
  app: Application;
  httpServer: HttpServer;
  url: string;
  port: number;
  close: () => Promise<void>;
}

// ============================================================================
// HTTP Server Creation
// ============================================================================

/**
 * Create Express HTTP server with SSE support for MCP
 * @param createMcpServer Factory function that creates a new MCP Server instance for each connection
 * @param options Server configuration options
 */
export function createHttpServer(
  createMcpServer: () => Server,
  options: ServerOptions
): OpenAIHttpServer {
  const { port, host = 'localhost', cors: enableCors = true } = options;

  const app: Application = express();

  // Middleware
  if (enableCors) {
    app.use(cors());
  }
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Server info endpoint
  app.get('/info', (_req: Request, res: Response) => {
    res.json({
      name: 'unido-openai',
      version: '0.1.0',
      protocol: 'mcp',
      transport: 'sse',
    });
  });

  // SSE endpoint - this is where MCP communication happens
  app.get('/sse', async (req: Request, res: Response) => {
    console.log('📡 SSE client connected');

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      // Create a NEW MCP server instance for this connection
      const mcpServer = createMcpServer();

      // Create SSE transport
      const transport = new SSEServerTransport('/messages', res);

      // Connect MCP server to transport
      console.log('🔌 Connecting new MCP server instance to SSE transport...');
      await mcpServer.connect(transport);
      console.log('✅ MCP server connected to SSE transport');

      // Handle client disconnect
      req.on('close', () => {
        console.log('📡 SSE client disconnected');
        transport.close().catch((err) => {
          console.error('Error closing transport:', err);
        });
      });
    } catch (error) {
      console.error('❌ Error connecting SSE transport:', error);
      res.status(500).end();
    }
  });

  // POST endpoint for MCP messages
  app.post('/messages', async (_req: Request, res: Response) => {
    try {
      // The SSE transport handles messages internally
      // This endpoint is primarily for the MCP protocol flow
      res.status(202).json({ accepted: true });
    } catch (error) {
      console.error('Error handling message:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Error handling middleware
  app.use(
    (
      err: Error,
      _req: Request,
      res: Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _next: express.NextFunction
    ) => {
      console.error('Server error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: err.message,
      });
    }
  );

  // Start HTTP server
  const httpServer = app.listen(port, host, () => {
    console.log(`✅ OpenAI MCP Server listening on http://${host}:${port}`);
    console.log(`   SSE endpoint: http://${host}:${port}/sse`);
    console.log(`   Health check: http://${host}:${port}/health`);
  });

  return {
    app,
    httpServer,
    url: `http://${host}:${port}`,
    port,
    close: async () => {
      return new Promise((resolve, reject) => {
        httpServer.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
  };
}
