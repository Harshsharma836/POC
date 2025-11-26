import { Router } from 'express';
import { SyncController } from '../controllers/sync.controller';
import { WebhookController } from '../controllers/webhook.controller';
import { WebhookManagementController } from '../controllers/webhook-management.controller';
import { ContactsController } from '../controllers/contacts.controller';
import { DealsController } from '../controllers/deals.controller';
import { CompaniesController } from '../controllers/companies.controller';

const router = Router();

const syncController = new SyncController();
const webhookController = new WebhookController();
const webhookManagementController = new WebhookManagementController();
const contactsController = new ContactsController();
const dealsController = new DealsController();
const companiesController = new CompaniesController();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
  });
});

router.post('/sync', syncController.syncAll);
router.post('/sync/contacts', syncController.syncContacts);
router.post('/sync/deals', syncController.syncDeals);
router.post('/sync/companies', syncController.syncCompanies);

router.post('/webhook', webhookController.handleWebhook);
router.get('/webhooks', webhookController.getWebhookEvents);

router.get('/webhook-subscriptions', webhookManagementController.getSubscriptions);
router.post('/webhook-subscriptions', webhookManagementController.createSubscription);
router.delete('/webhook-subscriptions/:subscriptionId', webhookManagementController.deleteSubscription);

router.get('/contacts', contactsController.getContacts);
router.get('/contacts/:id', contactsController.getContactById);

router.get('/deals', dealsController.getDeals);
router.get('/deals/:id', dealsController.getDealById);

router.get('/companies', companiesController.getCompanies);
router.get('/companies/:id', companiesController.getCompanyById);

export default router;

