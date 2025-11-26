import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Deal } from '../entities/Deal';
import { logger } from '../config/logger';

export class DealsController {
  private dealRepository = AppDataSource.getRepository(Deal);
  
  getDeals = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const stage = req.query.stage as string;
      const pipeline = req.query.pipeline as string;
      const minAmount = req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) || 'DESC';

      const queryBuilder = this.dealRepository.createQueryBuilder('deal');

      if (stage) {
        queryBuilder.where('deal.dealStage = :stage', { stage });
      }

      if (pipeline) {
        queryBuilder.andWhere('deal.pipeline = :pipeline', { pipeline });
      }

      if (minAmount !== undefined) {
        queryBuilder.andWhere('deal.amount >= :minAmount', { minAmount });
      }

      const allowedSortFields = [
        'createdAt',
        'updatedAt',
        'lastSyncedAt',
        'amount',
        'closeDate',
      ];
      const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const [deals, total] = await queryBuilder
        .orderBy(`deal.${safeSortBy}`, safeSortOrder)
        .limit(limit)
        .offset(offset)
        .getManyAndCount();

      res.status(200).json({
        success: true,
        data: {
          deals,
          total,
          limit,
          offset,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching deals', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch deals',
        error: error.message,
      });
    }
  };

  getDealById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const deal = await this.dealRepository.findOne({
        where: { id },
      });

      if (!deal) {
        res.status(404).json({
          success: false,
          message: 'Deal not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: deal,
      });
    } catch (error: any) {
      logger.error('Error fetching deal', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch deal',
        error: error.message,
      });
    }
  };
}

