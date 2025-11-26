import swaggerJsdoc from 'swagger-jsdoc';

const baseUrl = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const swaggerDefinition = {
  openapi: '3.0.1',
  info: {
    title: 'HubSpot Integration Service API',
    version: '1.0.0',
    description:
      'REST API for syncing HubSpot CRM data (contacts, deals, companies), handling webhooks, and exposing local data.',
  },
  servers: [
    {
      url: `${baseUrl}/api`,
      description: 'Primary API server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Service health endpoints' },
    { name: 'Sync', description: 'Data synchronization operations' },
    { name: 'Contacts', description: 'Local contacts API' },
    { name: 'Deals', description: 'Local deals API' },
    { name: 'Companies', description: 'Local companies API' },
    { name: 'Webhooks', description: 'Webhook ingestion and management' },
  ],
  components: {
    schemas: {
      PaginatedMeta: {
        type: 'object',
        properties: {
          limit: { type: 'integer', example: 50 },
          offset: { type: 'integer', example: 0 },
          total: { type: 'integer', example: 150 },
        },
      },
      Contact: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          hubspotId: { type: 'string' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          phone: { type: 'string' },
          company: { type: 'string' },
          jobTitle: { type: 'string' },
          lastSyncedAt: { type: 'string', format: 'date-time' },
          properties: { type: 'object', additionalProperties: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Deal: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          hubspotId: { type: 'string' },
          dealName: { type: 'string' },
          dealStage: { type: 'string' },
          amount: { type: 'number' },
          currency: { type: 'string' },
          pipeline: { type: 'string' },
          closeDate: { type: 'string', format: 'date-time' },
          dealType: { type: 'string' },
          lastSyncedAt: { type: 'string', format: 'date-time' },
          properties: { type: 'object', additionalProperties: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Company: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          hubspotId: { type: 'string' },
          name: { type: 'string' },
          domain: { type: 'string' },
          industry: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string' },
          phone: { type: 'string' },
          lastSyncedAt: { type: 'string', format: 'date-time' },
          properties: { type: 'object', additionalProperties: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      WebhookEvent: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          eventId: { type: 'string' },
          subscriptionId: { type: 'integer' },
          portalId: { type: 'integer' },
          eventType: { type: 'string' },
          objectId: { type: 'string' },
          payload: { type: 'object', additionalProperties: true },
          occurredAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      WebhookSubscriptionInput: {
        type: 'object',
        required: ['eventType', 'webhookUrl'],
        properties: {
          eventType: { type: 'string', example: 'contact.creation' },
          webhookUrl: { type: 'string', example: 'https://your-domain.com/api/webhook' },
        },
      },
      SyncResult: {
        type: 'object',
        properties: {
          created: { type: 'integer', example: 10 },
          updated: { type: 'integer', example: 5 },
          total: { type: 'integer', example: 15 },
        },
      },
      SyncSummary: {
        type: 'object',
        properties: {
          contacts: { $ref: '#/components/schemas/SyncResult' },
          deals: { $ref: '#/components/schemas/SyncResult' },
          companies: { $ref: '#/components/schemas/SyncResult' },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Service health check',
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Service is healthy' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
   '/sync/contacts': {
      post: {
        tags: ['Sync'],
        summary: 'Sync contacts only',
        responses: {
          200: {
            description: 'Contacts synced',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/SyncResult' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Sync failed',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/sync/deals': {
      post: {
        tags: ['Sync'],
        summary: 'Sync deals only',
        responses: {
          200: {
            description: 'Deals synced',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/SyncResult' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Sync failed',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/sync/companies': {
      post: {
        tags: ['Sync'],
        summary: 'Sync companies only',
        responses: {
          200: {
            description: 'Companies synced',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/SyncResult' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Sync failed',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/contacts': {
      get: {
        tags: ['Contacts'],
        summary: 'List contacts from local database',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 }, description: 'Page size' },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: 'Pagination offset' },
          { name: 'email', in: 'query', schema: { type: 'string' }, description: 'Filter by email (partial match)' },
          {
            name: 'company',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by company name (partial match)',
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'lastSyncedAt', 'email', 'firstName', 'lastName'] },
            description: 'Field to sort by',
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' },
            description: 'Sort order',
          },
        ],
        responses: {
          200: {
            description: 'Contacts returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        contacts: { type: 'array', items: { $ref: '#/components/schemas/Contact' } },
                        total: { type: 'integer' },
                        limit: { type: 'integer' },
                        offset: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to fetch contacts',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/contacts/{id}': {
      get: {
        tags: ['Contacts'],
        summary: 'Get a single contact',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Contact found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } },
          },
          404: {
            description: 'Contact not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/deals': {
      get: {
        tags: ['Deals'],
        summary: 'List deals from local database',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
          { name: 'stage', in: 'query', schema: { type: 'string' } },
          { name: 'pipeline', in: 'query', schema: { type: 'string' } },
          { name: 'minAmount', in: 'query', schema: { type: 'number' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'lastSyncedAt', 'amount', 'closeDate'] },
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' },
          },
        ],
        responses: {
          200: {
            description: 'Deals returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        deals: { type: 'array', items: { $ref: '#/components/schemas/Deal' } },
                        total: { type: 'integer' },
                        limit: { type: 'integer' },
                        offset: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to fetch deals',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/deals/{id}': {
      get: {
        tags: ['Deals'],
        summary: 'Get a single deal',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'Deal found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Deal' } } },
          },
          404: {
            description: 'Deal not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/companies': {
      get: {
        tags: ['Companies'],
        summary: 'List companies from local database',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
          { name: 'industry', in: 'query', schema: { type: 'string' } },
          { name: 'country', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'lastSyncedAt', 'name', 'industry'] },
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' },
          },
        ],
        responses: {
          200: {
            description: 'Companies returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        companies: { type: 'array', items: { $ref: '#/components/schemas/Company' } },
                        total: { type: 'integer' },
                        limit: { type: 'integer' },
                        offset: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to fetch companies',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/companies/{id}': {
      get: {
        tags: ['Companies'],
        summary: 'Get a single company',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'Company found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Company' } } },
          },
          404: {
            description: 'Company not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/webhook': {
      post: {
        tags: ['Webhooks'],
        summary: 'Receive webhook events from HubSpot',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/WebhookEvent' },
                  {
                    type: 'array',
                    items: { $ref: '#/components/schemas/WebhookEvent' },
                  },
                ],
              },
            },
          },
        },
        responses: {
          200: { description: 'Webhook processed', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { description: 'Invalid signature', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          500: { description: 'Processing failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/webhooks': {
      get: {
        tags: ['Webhooks'],
        summary: 'List stored webhook events',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
          { name: 'eventType', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Webhook events returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        events: { type: 'array', items: { $ref: '#/components/schemas/WebhookEvent' } },
                        total: { type: 'integer' },
                        limit: { type: 'integer' },
                        offset: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to fetch webhook events',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/webhook-subscriptions': {
      get: {
        tags: ['Webhooks'],
        summary: 'List webhook subscriptions configured in HubSpot',
        responses: {
          200: {
            description: 'Subscriptions returned',
            content: { 'application/json': { schema: { type: 'array', items: { type: 'object', additionalProperties: true } } } },
          },
          500: {
            description: 'Failed to fetch subscriptions',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      post: {
        tags: ['Webhooks'],
        summary: 'Create a new webhook subscription in HubSpot',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WebhookSubscriptionInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Subscription created',
            content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } },
          },
          400: {
            description: 'Invalid payload',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          500: {
            description: 'Failed to create subscription',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/webhook-subscriptions/{subscriptionId}': {
      delete: {
        tags: ['Webhooks'],
        summary: 'Delete a webhook subscription in HubSpot',
        parameters: [
          {
            name: 'subscriptionId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'HubSpot subscription ID',
          },
        ],
        responses: {
          200: { description: 'Subscription deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: {
            description: 'Invalid subscription ID',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          500: {
            description: 'Failed to delete subscription',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [],
});


