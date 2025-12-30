import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware';
import { authRoutes, usersRoutes, documentsRoutes, versionsRoutes, tagsRoutes } from './routes';
import { setupSwagger } from './swagger';

const app = express();

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check allowed origins
    if (config.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      // In production, you might want to block this. 
      // For now, consistent with your previous code:
      callback(null, true); 
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (Only for local dev / temp preview)
// Note: If using GridFS in prod, this might be unused, but keeping it is safe.
app.use('/uploads', express.static(config.uploadDir));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), environment: config.nodeEnv });
});

// Swagger API Documentation
setupSwagger(app);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/versions', versionsRoutes);
app.use('/api/tags', tagsRoutes);

// --- STATIC FRONTEND SERVING (Production) ---

if (config.nodeEnv === 'production') {
  // Correct Path Resolution:
  // __dirname is usually .../server/dist/
  // We go up: dist (..) -> server (..) -> root -> client -> dist -> dms-client
  const clientBuildPath = path.resolve(__dirname, '../../client/dist/dms-client');

  // 1. Serve Static Assets (JS, CSS, Images)
  app.use(express.static(clientBuildPath));

  // 2. SPA Fallback: Send index.html for any non-API route
  app.get('*', (req, res, next) => {
    // If the client requests an API route that doesn't exist, let it fall through to 404 handler
    // instead of returning the HTML page.
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    // Otherwise, serve the Angular app
    res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send('Error loading frontend');
      }
    });
  });
}

// Error handlers
// (These will catch any /api/* requests that didn't match a route)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
