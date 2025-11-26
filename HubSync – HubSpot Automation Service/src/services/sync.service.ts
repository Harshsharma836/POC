import { AppDataSource } from '../config/database';
import { Contact } from '../entities/Contact';
import { Deal } from '../entities/Deal';
import { Company } from '../entities/Company';
import { HubSpotService, HubSpotContact, HubSpotDeal, HubSpotCompany } from './hubspot.service';
import { logger } from '../config/logger';

export class SyncService {
  private hubspotService: HubSpotService;
  private contactRepository = AppDataSource.getRepository(Contact);
  private dealRepository = AppDataSource.getRepository(Deal);
  private companyRepository = AppDataSource.getRepository(Company);

  constructor() {
    this.hubspotService = new HubSpotService();
  }

  async syncContacts(): Promise<{ created: number; updated: number; total: number }> {
    logger.info('Starting contacts sync...');
    
    try {
      const hubspotContacts = await this.hubspotService.getAllContacts();
      logger.info(`Fetched ${hubspotContacts.length} contacts from HubSpot`);

      let created = 0;
      let updated = 0;

      for (const hubspotContact of hubspotContacts) {
        const existingContact = await this.contactRepository.findOne({
          where: { hubspotId: hubspotContact.id },
        });

        const contactData = {
          hubspotId: hubspotContact.id,
          email: hubspotContact.properties.email,
          firstName: hubspotContact.properties.firstname,
          lastName: hubspotContact.properties.lastname,
          phone: hubspotContact.properties.phone,
          company: hubspotContact.properties.company,
          jobTitle: hubspotContact.properties.jobtitle,
          properties: hubspotContact.properties,
          lastSyncedAt: new Date(),
        };

        if (existingContact) {
          Object.assign(existingContact, contactData);
          await this.contactRepository.save(existingContact);
          updated++;
        } else {
          const newContact = this.contactRepository.create(contactData);
          await this.contactRepository.save(newContact);
          created++;
        }
      }

      logger.info(`Contacts sync completed. Created: ${created}, Updated: ${updated}, Total: ${hubspotContacts.length}`);

      return {
        created,
        updated,
        total: hubspotContacts.length,
      };
    } catch (error) {
      logger.error('Error syncing contacts', error);
      throw error;
    }
  }

  async syncDeals(): Promise<{ created: number; updated: number; total: number }> {
    logger.info('Starting deals sync...');
    
    try {
      const hubspotDeals = await this.hubspotService.getAllDeals();
      logger.info(`Fetched ${hubspotDeals.length} deals from HubSpot`);

      let created = 0;
      let updated = 0;

      for (const hubspotDeal of hubspotDeals) {
        const existingDeal = await this.dealRepository.findOne({
          where: { hubspotId: hubspotDeal.id },
        });

        const dealData = {
          hubspotId: hubspotDeal.id,
          dealName: hubspotDeal.properties.dealname,
          dealStage: hubspotDeal.properties.dealstage,
          amount: hubspotDeal.properties.amount
            ? parseFloat(hubspotDeal.properties.amount)
            : null,
          currency: hubspotDeal.properties.deal_currency_code,
          pipeline: hubspotDeal.properties.pipeline,
          closeDate: hubspotDeal.properties.closedate
            ? new Date(hubspotDeal.properties.closedate)
            : null,
          dealType: hubspotDeal.properties.dealtype,
          properties: hubspotDeal.properties,
          lastSyncedAt: new Date(),
        };

        if (existingDeal) {
          Object.assign(existingDeal, dealData);
          await this.dealRepository.save(existingDeal);
          updated++;
        } else {
          const sanitizedDealData = {
            ...dealData,
            amount: dealData.amount ?? undefined,
            closeDate: dealData.closeDate ?? undefined,
            dealName: dealData.dealName ?? undefined,
            dealStage: dealData.dealStage ?? undefined,
            currency: dealData.currency ?? undefined,
            pipeline: dealData.pipeline ?? undefined,
            dealType: dealData.dealType ?? undefined,
        };
          const newDeal = this.dealRepository.create(sanitizedDealData);
          await this.dealRepository.save(newDeal);
          created++;
        }
      }

      logger.info(`Deals sync completed. Created: ${created}, Updated: ${updated}, Total: ${hubspotDeals.length}`);

      return {
        created,
        updated,
        total: hubspotDeals.length,
      };
    } catch (error) {
      logger.error('Error syncing deals', error);
      throw error;
    }
  }

  async syncCompanies(): Promise<{ created: number; updated: number; total: number }> {
    logger.info('Starting companies sync...');
    
    try {
      const hubspotCompanies = await this.hubspotService.getAllCompanies();
      logger.info(`Fetched ${hubspotCompanies.length} companies from HubSpot`);

      let created = 0;
      let updated = 0;

      for (const hubspotCompany of hubspotCompanies) {
        const existingCompany = await this.companyRepository.findOne({
          where: { hubspotId: hubspotCompany.id },
        });

        const companyData = {
          hubspotId: hubspotCompany.id,
          name: hubspotCompany.properties.name,
          domain: hubspotCompany.properties.domain,
          industry: hubspotCompany.properties.industry,
          city: hubspotCompany.properties.city,
          state: hubspotCompany.properties.state,
          country: hubspotCompany.properties.country,
          phone: hubspotCompany.properties.phone,
          properties: hubspotCompany.properties,
          lastSyncedAt: new Date(),
        };

        if (existingCompany) {
          Object.assign(existingCompany, companyData);
          await this.companyRepository.save(existingCompany);
          updated++;
        } else {
          const newCompany = this.companyRepository.create(companyData);
          await this.companyRepository.save(newCompany);
          created++;
        }
      }

      logger.info(`Companies sync completed. Created: ${created}, Updated: ${updated}, Total: ${hubspotCompanies.length}`);

      return {
        created,
        updated,
        total: hubspotCompanies.length,
      };
    } catch (error) {
      logger.error('Error syncing companies', error);
      throw error;
    }
  }

  async syncAll(): Promise<{
    contacts: { created: number; updated: number; total: number };
    deals: { created: number; updated: number; total: number };
    companies: { created: number; updated: number; total: number };
  }> {
    logger.info('Starting full sync...');

    const [contacts, deals, companies] = await Promise.all([
      this.syncContacts(),
      this.syncDeals(),
      this.syncCompanies(),
    ]);

    logger.info('Full sync completed');

    return {
      contacts,
      deals,
      companies,
    };
  }
}

