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
  const connections = new Map<string, { transport: SSEServerTransport; server: Server }>();

  const app: Application = express();

  // Middleware
  if (enableCors) {
    app.use(cors());
  }
  app.use(express.json({ limit: '4mb' }));

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
  app.get('/sse', async (_req: Request, res: Response) => {
    console.log('📡 SSE client connected');
    let transport: SSEServerTransport | undefined;
    let mcpServer: Server | undefined;

    try {
      // Create a NEW MCP server instance for this connection
      mcpServer = createMcpServer();

      // Create SSE transport
      transport = new SSEServerTransport('/messages', res);
      const sessionKey = transport.sessionId;
      connections.set(sessionKey, { transport, server: mcpServer });

      transport.onclose = () => {
        console.log('📡 SSE client disconnected');
        connections.delete(sessionKey);
        mcpServer
          ?.close()
          .catch((err) => {
            console.error('Error closing MCP server:', err);
          });
      };

      transport.onerror = (error) => {
        console.error(`❌ SSE transport error for session ${sessionKey}:`, error);
      };

      // Connect MCP server to transport
      console.log('🔌 Connecting new MCP server instance to SSE transport...');
      await mcpServer.connect(transport);
      console.log('✅ MCP server connected to SSE transport');
    } catch (error) {
      console.error('❌ Error connecting SSE transport:', error);
      if (transport) {
        connections.delete(transport.sessionId);
      }
      await mcpServer?.close().catch((err) => {
        console.error('Error closing MCP server:', err);
      });
      if (!res.headersSent) {
        res.status(500).end();
      } else {
        res.end();
      }
    }
  });

  // POST endpoint for MCP messages
  app.post('/messages', async (req: Request, res: Response) => {
    try {
      const sessionIdParam = req.query.sessionId;
      const sessionId =
        typeof sessionIdParam === 'string'
          ? sessionIdParam
          : Array.isArray(sessionIdParam)
            ? sessionIdParam.find((value): value is string => typeof value === 'string')
            : undefined;
      const headerSessionId = req.header('mcp-session-id');
      const activeSessionId = sessionId ?? headerSessionId;

      if (!activeSessionId) {
        res.status(400).json({
          error: 'Missing session identifier',
          message: 'Expected sessionId query parameter or mcp-session-id header',
        });
        return;
      }

      const connection = connections.get(activeSessionId);
      if (!connection) {
        res.status(404).json({
          error: 'Session not found',
          message: `No active SSE session for id ${activeSessionId}`,
        });
        return;
      }

      await connection.transport.handlePostMessage(req, res, req.body);
    } catch (error) {
      console.error('Error handling message:', error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : String(error),
        });
      }
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
