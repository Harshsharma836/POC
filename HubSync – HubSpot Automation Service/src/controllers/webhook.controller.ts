import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { WebhookEvent } from '../entities/WebhookEvent';
import { logger } from '../config/logger';
import crypto from 'crypto';

export class WebhookController {
  private webhookRepository = AppDataSource.getRepository(WebhookEvent);

  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const secret = process.env.WEBHOOK_SECRET;
    const signature = req.headers["x-hubspot-signature-v3"] as string;
    const raw = (req as any).rawBody;
  
    console.log("🔐 Incoming signature:", signature);
    console.log("🔐 Raw Body:", raw);
  
    if (this.verifySignature(req, secret as string)) {
      console.log("❌ Signature mismatch");
      res.status(401).send("Invalid signature");
      return;
    }
  
    console.log("✅ Signature verified");
  
    res.status(200).send("OK");
  };
  
  getWebhookEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const eventType = req.query.eventType as string;

      const queryBuilder = this.webhookRepository.createQueryBuilder('event');

      if (eventType) {
        queryBuilder.where('event.eventType = :eventType', { eventType });
      }

      const [events, total] = await queryBuilder
        .orderBy('event.createdAt', 'DESC')
        .limit(limit)
        .offset(offset)
        .getManyAndCount();

      res.status(200).json({
        success: true,
        data: {
          events,
          total,
          limit,
          offset,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching webhook events', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch webhook events',
        error: error.message,
      });
    }
  };

  private verifySignature(req: Request, secret: string): boolean {
    const signature = req.headers["x-hubspot-signature-v3"] as string;
    const method = req.method; 
    const path = req.originalUrl;  
    const rawBody = (req as any).rawBody;
  
    const dataToSign = method + path + rawBody;
  
    const expected = crypto
      .createHmac("sha256", secret)
      .update(dataToSign)
      .digest("base64");
  
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected)
      );
    } catch (err) {
      return false;
    }
  }
  
  
}

