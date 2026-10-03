import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = globalThis.process?.env?.PORT || 3000;

// 1. Centralized CORS Handling
const ALLOWED_ORIGIN = globalThis.process?.env?.RENDER_FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin === ALLOWED_ORIGIN) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * API DISPATCHER
 * We use a custom middleware to avoid path-to-regexp issues with wildcards in some Express versions.
 */
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    const endpoint = req.path.replace('/api/', '');
    if (!endpoint) {
      return res.status(404).json({ error: 'API root not found' });
    }

    const handlerPath = path.join(__dirname, 'api', `${endpoint}.js`);
    const fileUrl = `file://${handlerPath}`;

    if (fs.existsSync(handlerPath)) {
      (async () => {
        try {
          const { default: handler } = await import(fileUrl);
          await handler(req, res);
        } catch (error) {
          console.error(`[Server Error] Dispatch failed for ${endpoint}:`, error);
          res.status(500).json({
            error: 'Internal Server Error',
            code: 'server/dispatch-failed'
          });
        }
      })();
      return; // Stop middleware chain
    }
  }
  next();
});

app.listen(PORT, () => {
  console.warn(`Render API Web Service running on port ${PORT}`);
});
