import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware';
import { authRoutes, usersRoutes, documentsRoutes, versionsRoutes, tagsRoutes } from './routes';
import { setupSwagger } from './swagger';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || config.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow anyway for development
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

// Serve uploaded files statically (for preview)
app.use('/uploads', express.static(config.uploadDir));

// Serve static files from client build
const clientBuildPath = path.join(__dirname, '../../client/dist');
if (config.nodeEnv === 'production') {
  app.use(express.static(clientBuildPath));
}

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

// Serve SPA fallback for client routes (production only)
if (config.nodeEnv === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
