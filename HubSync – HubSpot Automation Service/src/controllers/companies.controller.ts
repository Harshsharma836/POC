import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Company } from '../entities/Company';
import { logger } from '../config/logger';

export class CompaniesController {
  private companyRepository = AppDataSource.getRepository(Company);

  getCompanies = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const industry = req.query.industry as string;
      const country = req.query.country as string;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) || 'DESC';

      const queryBuilder = this.companyRepository.createQueryBuilder('company');

      if (industry) {
        queryBuilder.where('company.industry ILIKE :industry', {
          industry: `%${industry}%`,
        });
      }

      if (country) {
        queryBuilder.andWhere('company.country ILIKE :country', {
          country: `%${country}%`,
        });
      }

      const allowedSortFields = [
        'createdAt',
        'updatedAt',
        'lastSyncedAt',
        'name',
        'industry',
      ];
      const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const [companies, total] = await queryBuilder
        .orderBy(`company.${safeSortBy}`, safeSortOrder)
        .limit(limit)
        .offset(offset)
        .getManyAndCount();

      res.status(200).json({
        success: true,
        data: {
          companies,
          total,
          limit,
          offset,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching companies', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch companies',
        error: error.message,
      });
    }
  };

  getCompanyById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const company = await this.companyRepository.findOne({
        where: { id },
      });

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: company,
      });
    } catch (error: any) {
      logger.error('Error fetching company', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch company',
        error: error.message,
      });
    }
  };
}

