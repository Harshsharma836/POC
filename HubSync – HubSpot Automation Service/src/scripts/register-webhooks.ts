import 'reflect-metadata';
import dotenv from 'dotenv';
import { registerWebhooks } from '../utils/webhook-registration';

dotenv.config();

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

registerWebhooks(baseUrl)
  .then(() => {
    console.log('Webhook registration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Webhook registration failed', error);
    process.exit(1);
  });

