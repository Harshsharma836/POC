import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { logger } from './config/logger';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
console.log('PORT -->>', PORT);

app.use(helmet());
app.use(cors());

app.use(
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});


app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.get('/api/docs.json', (req, res) => {
  res.json(swaggerSpec);
});

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({
    message: 'HubSpot Integration Service API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      sync: '/api/sync',
      contacts: '/api/contacts',
      deals: '/api/deals',
      companies: '/api/companies',
      webhooks: '/api/webhooks',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

async function startServer() {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established');

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await AppDataSource.destroy();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await AppDataSource.destroy();
  process.exit(0);
});

startServer();

