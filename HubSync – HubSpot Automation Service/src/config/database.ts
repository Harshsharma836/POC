import { DataSource } from 'typeorm';
import { Contact } from '../entities/Contact';
import { Deal } from '../entities/Deal';
import { Company } from '../entities/Company';
import { WebhookEvent } from '../entities/WebhookEvent';
import dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'harsh',
  password: process.env.DB_PASSWORD || '1234@Harsh',
  database: process.env.DB_NAME || 'HubspotCRM',
  entities: [Contact, Deal, Company, WebhookEvent],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});

