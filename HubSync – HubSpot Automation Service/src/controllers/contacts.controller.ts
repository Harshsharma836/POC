import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Contact } from '../entities/Contact';
import { logger } from '../config/logger';

export class ContactsController {
  private contactRepository = AppDataSource.getRepository(Contact);

  
  getContacts = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const email = req.query.email as string;
      const company = req.query.company as string;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) || 'DESC';

      const queryBuilder = this.contactRepository.createQueryBuilder('contact');

      if (email) {
        queryBuilder.where('contact.email ILIKE :email', {
          email: `%${email}%`,
        });
      }

      if (company) {
        queryBuilder.andWhere('contact.company ILIKE :company', {
          company: `%${company}%`,
        });
      }

      const allowedSortFields = [
        'createdAt',
        'updatedAt',
        'lastSyncedAt',
        'email',
        'firstName',
        'lastName',
      ];
      const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const [contacts, total] = await queryBuilder
        .orderBy(`contact.${safeSortBy}`, safeSortOrder)
        .limit(limit)
        .offset(offset)
        .getManyAndCount();

      res.status(200).json({
        success: true,
        data: {
          contacts,
          total,
          limit,
          offset,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching contacts', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch contacts',
        error: error.message,
      });
    }
  };

  getContactById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const contact = await this.contactRepository.findOne({
        where: { id },
      });

      if (!contact) {
        res.status(404).json({
          success: false,
          message: 'Contact not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: contact,
      });
    } catch (error: any) {
      logger.error('Error fetching contact', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch contact',
        error: error.message,
      });
    }
  };
}

