import axios, { AxiosInstance, AxiosError } from 'axios';
import pRetry from 'p-retry';
import { logger } from '../config/logger';
import dotenv from 'dotenv';
dotenv.config();

export interface HubSpotContact {
  id: string;
  properties: {
    email?: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    company?: string;
    jobtitle?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HubSpotDeal {
  id: string;
  properties: {
    dealname?: string;
    dealstage?: string;
    amount?: string;
    deal_currency_code?: string;
    pipeline?: string;
    closedate?: string;
    dealtype?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HubSpotCompany {
  id: string;
  properties: {
    name?: string;
    domain?: string;
    industry?: string;
    city?: string;
    state?: string;
    country?: string;
    phone?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HubSpotPaginatedResponse<T> {
  results: T[];
  paging?: {
    next?: {
      after: string;
      link: string;
    };
  };
}

export class HubSpotService {
  private client: AxiosInstance;
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.HUBSPOT_API_KEY || ""; 
    this.baseURL = 'https://api.hubapi.com';

    if (!this.apiKey) {
      throw new Error('HUBSPOT_API_KEY is required');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`HubSpot API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('HubSpot API Request Error', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data as any;

          if (status === 429) {
            const retryAfter = error.response.headers['retry-after'];
            logger.warn(`Rate limit hit. Retry after: ${retryAfter} seconds`);
            throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
          }

          logger.error('HubSpot API Error', {
            status,
            statusText: error.response.statusText,
            data,
            url: error.config?.url,
          });
        }

        return Promise.reject(error);
      }
    );
  }

  private async retryRequest<T>(
    fn: () => Promise<T>,
    retries = 3
  ): Promise<T> {
    return pRetry(fn, {
      retries,
      onFailedAttempt: (error) => {
        logger.warn(
          `Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`,
          error.message
        );
      },
    });
  }

  async getContacts(after?: string, limit = 100): Promise<HubSpotPaginatedResponse<HubSpotContact>> {
    return this.retryRequest(async () => {
      const params: any = { limit };
      if (after) {
        params.after = after;
      }

      const response = await this.client.get('/crm/v3/objects/contacts', {
        params: {
          ...params,
          properties: 'email,firstname,lastname,phone,company,jobtitle',
        },
      });

      return response.data;
    });
  }

  async getAllContacts(): Promise<HubSpotContact[]> {
    const allContacts: HubSpotContact[] = [];
    let after: string | undefined;

    do {
      const response = await this.getContacts(after);
      allContacts.push(...response.results);

      after = response.paging?.next?.after;
      
      if (after) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } while (after);

    return allContacts;
  }

  async getDeals(after?: string, limit = 100): Promise<HubSpotPaginatedResponse<HubSpotDeal>> {
    return this.retryRequest(async () => {
      const params: any = { limit };
      if (after) {
        params.after = after;
      }

      const response = await this.client.get('/crm/v3/objects/deals', {
        params: {
          ...params,
          properties: 'amount',
        },
      });
      return response.data;
    });
  }

  async getAllDeals(): Promise<HubSpotDeal[]> {
    const allDeals: HubSpotDeal[] = [];
    let after: string | undefined;

    do {
      const response = await this.getDeals(after);
      allDeals.push(...response.results);

      after = response.paging?.next?.after;
      
      if (after) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } while (after);

    return allDeals;
  }

  async getCompanies(after?: string, limit = 100): Promise<HubSpotPaginatedResponse<HubSpotCompany>> {
    return this.retryRequest(async () => {
      const params: any = { limit };
      if (after) {
        params.after = after;
      }

      const response = await this.client.get('/crm/v3/objects/companies', {
        params: {
          ...params,
          properties: 'name,domain,industry,city,state,country,phone',
        },
      });

      return response.data;
    });
  }

  async getAllCompanies(): Promise<HubSpotCompany[]> {
    const allCompanies: HubSpotCompany[] = [];
    let after: string | undefined;

    do {
      const response = await this.getCompanies(after);
      allCompanies.push(...response.results);

      after = response.paging?.next?.after;
      
      if (after) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } while (after);

    return allCompanies;
  }

  async createWebhookSubscription(
    eventType: string,
    webhookUrl: string
  ): Promise<any> {
    return this.retryRequest(async () => {
      const response = await this.client.post('/webhooks/v3/subscriptions', {
        eventType,
        propertyName: null,
        active: true,
        webhookUrl,
      });

      return response.data;
    });
  }

  async getWebhookSubscriptions(): Promise<any> {
    return this.retryRequest(async () => {
      const response = await this.client.get('/webhooks/v3/subscriptions');
      return response.data;
    });
  }

  async deleteWebhookSubscription(subscriptionId: number): Promise<void> {
    return this.retryRequest(async () => {
      await this.client.delete(`/webhooks/v3/subscriptions/${subscriptionId}`);
    });
  }
}

