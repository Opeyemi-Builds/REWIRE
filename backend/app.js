import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import scenarioRoutes from './routes/scenarioRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import ecobankRoutes from './routes/ecobankRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// --- Global middleware ---
// Same idea as FastAPI's app.add_middleware(...) calls - these run on every request.
app.use(helmet());       // sets safe HTTP headers
app.use(cors());         // allows the frontend (different origin/port) to call this API
app.use(morgan('dev'));  // logs each request to the console
app.use(express.json()); // parses incoming JSON bodies -> req.body (like FastAPI does automatically)

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'rewire-backend' });
});

// --- Routes ---
// Each of these is the Express equivalent of mounting an APIRouter with a prefix:
//   app.include_router(auth_router, prefix="/api/auth")
app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/ecobank', ecobankRoutes);
app.use('/api/ai', aiRoutes);

// --- 404 handler (no route matched) ---
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// --- Centralized error handler - must be registered last ---
app.use(errorHandler);

export default app;
