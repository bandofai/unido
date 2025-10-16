# Logging in @bandofai/unido-provider-openai

The OpenAI provider includes a comprehensive logging system with configurable verbosity levels to help you debug and monitor your MCP server.

## Quick Start

### Set Log Level

Control logging verbosity using the `UNIDO_LOG_LEVEL` environment variable:

```bash
# Default (info level)
pnpm run dev

# Debug level (more verbose)
UNIDO_LOG_LEVEL=debug pnpm run dev

# Trace level (very verbose, includes all operations)
UNIDO_LOG_LEVEL=trace pnpm run dev

# Quiet (only errors and warnings)
UNIDO_LOG_LEVEL=warn pnpm run dev

# Silent (no logs)
UNIDO_LOG_LEVEL=silent pnpm run dev
```

## Log Levels

The logger supports six levels of verbosity (from most to least verbose):

| Level | Description | Use Case |
|-------|-------------|----------|
| `trace` | Very detailed logs including all operations | Deep debugging of request/response flow |
| `debug` | Detailed logs for development | Development and troubleshooting |
| `info` | General information (default) | Production monitoring |
| `warn` | Warning messages | Issues that don't cause failures |
| `error` | Error messages only | Production error tracking |
| `silent` | No logs | Testing or when logs are not needed |

## What Gets Logged

### Info Level (Default)

- Server startup and configuration
- SSE client connections/disconnections
- Component preparation and bundling
- File watcher events (when enabled)
- Component rebundling

### Debug Level

- Configuration details (port, host, components count)
- MCP server instance creation
- SSE transport creation with session IDs
- Active connection counts
- Tool call handling
- Component preparation details (bundle sizes)

### Trace Level

- Individual MCP message handling
- Tool handler execution
- Detailed request/response flow

## Log Format

Logs are structured with timestamps and contextual metadata:

```
2025-10-16T13:22:20.777Z [unido:adapter] [INFO] Preparing components {"count":1}
2025-10-16T13:22:20.949Z [unido:adapter]:server [INFO] OpenAI MCP Server started {"url":"http://localhost:3000","endpoints":{"sse":"http://localhost:3000/sse","health":"http://localhost:3000/health","info":"http://localhost:3000/info"},"logLevel":"info"}
2025-10-16T13:22:25.123Z [unido:adapter] [DEBUG] Handling tool call {"toolName":"get_weather"}
```

Format: `<timestamp> <prefix> [<level>] <message> <metadata>`

## Programmatic Usage

You can also create custom loggers in your application:

```typescript
import { createLogger, type LogLevel } from '@bandofai/unido-provider-openai';

// Create a logger with custom settings
const logger = createLogger({
  prefix: '[my-app]',
  level: 'debug' // Override env var
});

logger.info('Application started');
logger.debug('Debug information', { userId: 123 });
logger.error('An error occurred', error, { context: 'user-login' });

// Create child loggers for different components
const dbLogger = logger.child('database');
dbLogger.info('Database connected');
```

## Logger API

### Methods

```typescript
logger.error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void
logger.warn(message: string, meta?: Record<string, unknown>): void
logger.info(message: string, meta?: Record<string, unknown>): void
logger.debug(message: string, meta?: Record<string, unknown>): void
logger.trace(message: string, meta?: Record<string, unknown>): void
```

### Utilities

```typescript
logger.getLevel(): LogLevel  // Get current log level
logger.setLevel(level: LogLevel): void  // Change log level at runtime
logger.child(prefix: string): Logger  // Create child logger
```

## Examples

### Development with Debug Logs

```bash
UNIDO_LOG_LEVEL=debug pnpm run dev
```

Output:
```
2025-10-16T13:22:20.777Z [unido:adapter] [DEBUG] Initializing OpenAI adapter {"name":"weather-app","version":"1.0.0"}
2025-10-16T13:22:20.777Z [unido:adapter] [DEBUG] Configuration loaded {"port":3000,"host":"localhost","watchEnabled":false,"componentsCount":1,"toolsCount":2}
2025-10-16T13:22:20.777Z [unido:adapter] [INFO] Preparing components {"count":1}
2025-10-16T13:22:20.943Z [unido:adapter] [DEBUG] Components bundled {"successCount":1}
2025-10-16T13:22:20.943Z [unido:adapter] [DEBUG] Component prepared {"type":"weather-card","uri":"ui://widget/weather-card.html","bundleSize":12543}
```

### Production with Info Level

```bash
# Default - no env var needed
pnpm run dev
```

Output:
```
2025-10-16T13:22:20.777Z [unido:adapter] [INFO] Preparing components {"count":1}
2025-10-16T13:22:20.943Z [unido:adapter] [INFO] Components preparation complete {"total":1,"registered":1}
2025-10-16T13:22:20.949Z [unido:adapter]:server [INFO] OpenAI MCP Server started {"url":"http://localhost:3000"}
```

### Debugging Tool Calls

```bash
UNIDO_LOG_LEVEL=trace pnpm run dev
```

Then when a tool is called:
```
2025-10-16T13:25:10.123Z [unido:adapter] [DEBUG] Handling tool call {"toolName":"get_weather"}
2025-10-16T13:25:10.124Z [unido:adapter] [TRACE] Executing tool handler {"toolName":"get_weather"}
2025-10-16T13:25:10.234Z [unido:adapter] [DEBUG] Tool executed successfully {"toolName":"get_weather"}
2025-10-16T13:25:10.235Z [unido:adapter]:server [TRACE] Handling MCP message {"sessionId":"abc123","method":"tools/call"}
2025-10-16T13:25:10.236Z [unido:adapter]:server [TRACE] MCP message handled successfully {"sessionId":"abc123"}
```

## Benefits

1. **Troubleshooting**: Quickly identify issues with detailed error messages and context
2. **Performance Monitoring**: Track component bundling times and request handling
3. **Development**: See exactly what's happening during development with debug/trace levels
4. **Production**: Clean, informative logs at info level for monitoring
5. **Flexibility**: Change verbosity without code changes using environment variables

## Related

- [DEVELOPMENT.md](../../../DEVELOPMENT.md) - Development guide
- [QUICKSTART.md](../../../QUICKSTART.md) - Quick start guide
- [README.md](../../../README.md) - Main documentation
