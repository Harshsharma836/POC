import { Request, Response } from 'express';
import { HubSpotService } from '../services/hubspot.service';
import { logger } from '../config/logger';

export class WebhookManagementController {
  private hubspotService: HubSpotService;

  constructor() {
    this.hubspotService = new HubSpotService();
  }

  getSubscriptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const subscriptions = await this.hubspotService.getWebhookSubscriptions();

      res.status(200).json({
        success: true,
        data: subscriptions,
      });
    } catch (error: any) {
      logger.error('Error fetching webhook subscriptions', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch webhook subscriptions',
        error: error.message,
      });
    }
  };

  createSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventType, webhookUrl } = req.body;

      if (!eventType || !webhookUrl) {
        res.status(400).json({
          success: false,
          message: 'eventType and webhookUrl are required',
        });
        return;
      }

      const subscription = await this.hubspotService.createWebhookSubscription(
        eventType,
        webhookUrl
      );

      res.status(201).json({
        success: true,
        message: 'Webhook subscription created',
        data: subscription,
      });
    } catch (error: any) {
      logger.error('Error creating webhook subscription', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create webhook subscription',
        error: error.message,
      });
    }
  };

  deleteSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { subscriptionId } = req.params;

      if (!subscriptionId) {
        res.status(400).json({
          success: false,
          message: 'subscriptionId is required',
        });
        return;
      }

      await this.hubspotService.deleteWebhookSubscription(
        parseInt(subscriptionId)
      );

      res.status(200).json({
        success: true,
        message: 'Webhook subscription deleted',
      });
    } catch (error: any) {
      logger.error('Error deleting webhook subscription', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete webhook subscription',
        error: error.message,
      });
    }
  };
}

