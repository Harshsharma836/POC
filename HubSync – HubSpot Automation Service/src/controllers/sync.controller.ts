import { Request, Response } from 'express';
import { SyncService } from '../services/sync.service';
import { logger } from '../config/logger';

export class SyncController {
  private syncService: SyncService;

  constructor() {
    this.syncService = new SyncService();
  }

  syncAll = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Sync all request received');
      const result = await this.syncService.syncAll();

      res.status(200).json({
        success: true,
        message: 'Sync completed successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('Error in sync all', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync data',
        error: error.message,
      });
    }
  };

  syncContacts = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Sync contacts request received');
      const result = await this.syncService.syncContacts();

      res.status(200).json({
        success: true,
        message: 'Contacts sync completed successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('Error in sync contacts', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync contacts',
        error: error.message,
      });
    }
  };

  syncDeals = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Sync deals request received');
      const result = await this.syncService.syncDeals();

      res.status(200).json({
        success: true,
        message: 'Deals sync completed successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to sync deals',
        error: error.message,
      });
    }
  };

  syncCompanies = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Sync companies request received');
      const result = await this.syncService.syncCompanies();

      res.status(200).json({
        success: true,
        message: 'Companies sync completed successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('Error in sync companies', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync companies',
        error: error.message,
      });
    }
  };
}

