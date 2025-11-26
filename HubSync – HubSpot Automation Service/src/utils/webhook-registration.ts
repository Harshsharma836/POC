import { HubSpotService } from '../services/hubspot.service';
import { logger } from '../config/logger';

export async function registerWebhooks(baseUrl: string) {
  const hubspotService = new HubSpotService();

  const eventTypes = [
    'contact.creation',
    'contact.propertyChange',
    'contact.deletion',
    'deal.creation',
    'deal.propertyChange',
    'deal.deletion',
    'company.creation',
    'company.propertyChange',
    'company.deletion',
  ];

  const webhookUrl = `${baseUrl}/api/webhook`;

  logger.info(`Registering webhooks for: ${webhookUrl}`);

  for (const eventType of eventTypes) {
    try {
      const subscription = await hubspotService.createWebhookSubscription(
        eventType,
        webhookUrl
      );
      logger.info(`Registered webhook for ${eventType}:`, subscription);
    } catch (error: any) {
      logger.error(`Failed to register webhook for ${eventType}:`, error.message);
    }
  }

  try {
    const subscriptions = await hubspotService.getWebhookSubscriptions();
    logger.info('Current webhook subscriptions:', subscriptions);
  } catch (error: any) {
    logger.error('Failed to list webhook subscriptions:', error.message);
  }
}

if (require.main === module) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  registerWebhooks(baseUrl)
    .then(() => {
      logger.info('Webhook registration completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Webhook registration failed', error);
      process.exit(1);
    });
}

