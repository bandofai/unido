/**
 * HTTP Server with SSE for OpenAI MCP
 * Implements Express server with Server-Sent Events transport
 */

import type { Server as HttpServer } from 'node:http';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import cors from 'cors';
import express, { type Application, type Request, type Response } from 'express';
import { type Logger, createLogger } from './logger.js';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build CSP directive string from configuration
 */
function buildCSPDirectives(csp: NonNullable<ServerOptions['csp']>): string | null {
  const level = csp.level || 'trusted';

  // Base directives for each level
  const baseDirectives: Record<string, string[]> = level === 'untrusted'
    ? {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'strict-dynamic'"],
        'style-src': ["'self'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': ["'self'"],
        'font-src': ["'self'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
      }
    : {
        'default-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'data:', 'blob:'],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': ["'self'"],
        'font-src': ["'self'", 'data:'],
        'object-src': ["'none'"],
      };

  // Merge with custom directives
  const directives = { ...baseDirectives, ...csp.directives };

  // Build CSP string
  const parts: string[] = [];
  for (const [directive, values] of Object.entries(directives)) {
    if (values && values.length > 0) {
      parts.push(`${directive} ${values.join(' ')}`);
    }
  }

  return parts.length > 0 ? parts.join('; ') : null;
}

// ============================================================================
// Types
// ============================================================================

export interface ServerOptions {
  port: number;
  host?: string;
  cors?: boolean;
  logger?: Logger;
  /**
   * Content Security Policy configuration for HTTP headers
   * Provides defense-in-depth security for served resources
   * @default undefined (no CSP headers)
   */
  csp?: {
    /**
     * Security level: 'trusted' for development, 'untrusted' for production
     */
    level?: 'trusted' | 'untrusted';
    /**
     * Custom CSP directives
     */
    directives?: Record<string, string[]>;
  };
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
  const { port, host = 'localhost', cors: enableCors = true, logger: providedLogger, csp } = options;
  const logger = providedLogger || createLogger({ prefix: '[unido:server]' });
  const connections = new Map<string, { transport: SSEServerTransport; server: Server }>();

  const app: Application = express();

  // Middleware
  if (enableCors) {
    app.use(cors());
  }
  app.use(express.json({ limit: '4mb' }));

  // CSP middleware (defense in depth)
  if (csp) {
    app.use((_req: Request, res: Response, next: express.NextFunction) => {
      const cspDirectives = buildCSPDirectives(csp);
      if (cspDirectives) {
        res.setHeader('Content-Security-Policy', cspDirectives);
      }
      next();
    });
  }

  // Basic root endpoint so health checks against "/" succeed (e.g. tunnels, connectors)
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      name: 'unido-openai',
      protocol: 'mcp',
      endpoints: {
        health: '/health',
        info: '/info',
        sse: '/sse',
        messages: '/messages',
      },
    });
  });

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
    const clientInfo = {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      origin: req.get('origin')
    };
    logger.info('🔌 ChatGPT SSE client connecting', clientInfo);
    logger.debug('Creating new SSE transport', { endpoint: '/sse' });
    let transport: SSEServerTransport | undefined;
    let mcpServer: Server | undefined;

    try {
      // Create a NEW MCP server instance for this connection
      mcpServer = createMcpServer();
      logger.debug('MCP server instance created');

      // Create SSE transport
      transport = new SSEServerTransport('/messages', res);
      const sessionKey = transport.sessionId;
      connections.set(sessionKey, { transport, server: mcpServer });
      logger.info('🔗 SSE transport created', {
        sessionId: sessionKey,
        activeConnections: connections.size,
        ...clientInfo
      });

      transport.onclose = () => {
        logger.info('🔌 ChatGPT SSE client disconnected', { sessionId: sessionKey });
        connections.delete(sessionKey);
        logger.debug('Connection removed', { remainingConnections: connections.size });

        if (!mcpServer) {
          return;
        }

        const serverToClose = mcpServer;
        mcpServer = undefined;

        serverToClose.close().catch((err) => {
          logger.error('Error closing MCP server', err, { sessionId: sessionKey });
        });
      };

      transport.onerror = (error) => {
        logger.error('❌ SSE transport error', error, { sessionId: sessionKey });
      };

      // Connect MCP server to transport
      logger.debug('Connecting MCP server to SSE transport', { sessionId: sessionKey });
      await mcpServer.connect(transport);
      logger.info('✅ MCP server connected successfully to ChatGPT', { sessionId: sessionKey });
    } catch (error) {
      logger.error('❌ Error connecting SSE transport', error);
      if (transport) {
        connections.delete(transport.sessionId);
        logger.debug('Cleaned up failed connection', { sessionId: transport.sessionId });
      }
      await mcpServer?.close().catch((err) => {
        logger.error('Error closing MCP server after failed connection', err);
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
        logger.warn('⚠️  Message received without session identifier');
        res.status(400).json({
          error: 'Missing session identifier',
          message: 'Expected sessionId query parameter or mcp-session-id header',
        });
        return;
      }

      const connection = connections.get(activeSessionId);
      if (!connection) {
        logger.warn('⚠️  Message received for unknown session', { sessionId: activeSessionId });
        res.status(404).json({
          error: 'Session not found',
          message: `No active SSE session for id ${activeSessionId}`,
        });
        return;
      }

      logger.info('📨 Incoming MCP message from ChatGPT', {
        sessionId: activeSessionId,
        method: req.body?.method,
        id: req.body?.id,
        params: JSON.stringify(req.body?.params, null, 2)
      });
      await connection.transport.handlePostMessage(req, res, req.body);
      logger.info('✉️  MCP message handled successfully', {
        sessionId: activeSessionId,
        method: req.body?.method
      });
    } catch (error) {
      logger.error('❌ Error handling message', error);
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
      logger.error('Server error', err);
      res.status(500).json({
        error: 'Internal server error',
        message: err.message,
      });
    }
  );

  // Start HTTP server
  const httpServer = app.listen(port, host, () => {
    logger.info('OpenAI MCP Server started', {
      url: `http://${host}:${port}`,
      endpoints: {
        sse: `http://${host}:${port}/sse`,
        health: `http://${host}:${port}/health`,
        info: `http://${host}:${port}/info`,
      },
      logLevel: logger.getLevel(),
    });
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
