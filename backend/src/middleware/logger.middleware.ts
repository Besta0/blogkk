import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { config } from '../config';

/**
 * Request logging middleware
 * Provides detailed logging for API requests and responses
 */

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req: Request, res: Response) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

// Custom token for request ID
morgan.token('request-id', (req: Request) => {
  return (req as any).id || '-';
});

// Custom token for user ID (if authenticated)
morgan.token('user-id', (req: Request) => {
  return (req as any).user?.id || 'anonymous';
});

// Development format - detailed and colorful
const devFormat =
  ':method :url :status :response-time ms - :res[content-length] bytes';

// Production format - structured for log aggregation
const prodFormat =
  ':remote-addr - :user-id [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Combined format with request ID
const combinedFormat =
  ':request-id :remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

/**
 * Get appropriate morgan format based on environment
 */
const getLogFormat = (): string => {
  switch (config.NODE_ENV) {
    case 'development':
      return devFormat;
    case 'production':
      return prodFormat;
    default:
      return combinedFormat;
  }
};

/**
 * Custom morgan stream for colored output in development
 */
const morganStream = {
  write: (message: string) => {
    // Parse the message to extract method, URL, status, and time
    const match = message.match(/(\w+)\s+([\w\/\-\.?=&]+)\s+(\d+)\s+(\d+)ms/);
    if (match && config.NODE_ENV === 'development') {
      const [, method, url, status, time] = match;
      const statusNum = parseInt(status);
      
      // Color based on status code
      let statusColor = '\x1b[32m'; // Green for 2xx
      if (statusNum >= 300 && statusNum < 400) statusColor = '\x1b[36m'; // Cyan for 3xx
      else if (statusNum >= 400 && statusNum < 500) statusColor = '\x1b[33m'; // Yellow for 4xx
      else if (statusNum >= 500) statusColor = '\x1b[31m'; // Red for 5xx
      
      // Method colors
      let methodColor = '\x1b[36m'; // Cyan
      if (method === 'POST') methodColor = '\x1b[32m'; // Green
      else if (method === 'PUT') methodColor = '\x1b[33m'; // Yellow
      else if (method === 'DELETE') methodColor = '\x1b[31m'; // Red
      else if (method === 'PATCH') methodColor = '\x1b[35m'; // Magenta
      
      const reset = '\x1b[0m';
      console.log(`${methodColor}${method}${reset} ${url} ${statusColor}${status}${reset} ${time}ms`);
    } else {
      process.stdout.write(message);
    }
  },
};

/**
 * Morgan logging middleware
 */
export const requestLogger = morgan(getLogFormat(), {
  stream: morganStream,
  skip: (req: Request) => {
    // Skip logging for health check endpoint
    return req.url === '/health' || req.url === '/api/health';
  },
});

/**
 * Custom request ID middleware
 * Adds a unique ID to each request for tracking
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  (req as any).id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

/**
 * Response time tracking middleware
 * Measures and logs the time taken to process each request
 */
export const responseTimeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Override res.end to calculate response time
  const originalEnd = res.end.bind(res);
  res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
    const duration = Date.now() - startTime;
    res.setHeader('X-Response-Time', duration);

    // Log slow requests (> 1000ms)
    if (duration > 1000) {
      console.warn(
        `⚠️  Slow request detected: ${req.method} ${req.url} took ${duration}ms`
      );
    }

    return originalEnd(chunk, encoding, callback);
  };

  next();
};

/**
 * Request details logger for debugging
 * Logs detailed information about incoming requests in development
 */
export const detailedRequestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (config.NODE_ENV === 'development') {
    console.log('\n📥 Incoming Request:');
    console.log(`  Method: ${req.method}`);
    console.log(`  URL: ${req.url}`);
    console.log(`  Headers:`, req.headers);
    console.log(`  Body:`, req.body);
    console.log(`  Query:`, req.query);
    console.log(`  Params:`, req.params);
  }
  next();
};
