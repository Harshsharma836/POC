import { Response } from 'express';
import { LeaderboardService } from '../services/LeaderboardService';
import { GameMode } from '../entities/GameSession';
import { AuthenticatedRequest } from '../middleware/auth';
import { validateScore, validateUserId, validateGameMode } from '../utils/validation';

const leaderboardService = new LeaderboardService();

export class LeaderboardController {
 
  async submitScore(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { user_id, score, game_mode } = req.body;

      const userIdValidation = validateUserId(user_id);
      if (!userIdValidation.valid) {
        res.status(400).json({ 
          success: false,
          error: userIdValidation.error 
        });
        return;
      }

      const scoreValidation = validateScore(score);
      if (!scoreValidation.valid) {
        res.status(400).json({ 
          success: false,
          error: scoreValidation.error 
        });
        return;
      }

      const gameModeValidation = validateGameMode(game_mode);
      if (!gameModeValidation.valid) {
        res.status(400).json({ 
          success: false,
          error: gameModeValidation.error 
        });
        return;
      }
      
      const finalUserId = req.userId || userIdValidation.value!;

      await leaderboardService.submitScore(
        finalUserId,
        scoreValidation.value!,
        gameModeValidation.value!
      );

      res.status(200).json({
        success: true,
        message: 'Score submitted successfully',
      });
    } catch (error) {
      console.error('Error submitting score:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getTopPlayers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { validateLimit } = require('../utils/validation');
      
      const limitValidation = validateLimit(req.query.limit);
      if (!limitValidation.valid) {
        res.status(400).json({ 
          success: false,
          error: limitValidation.error 
        });
        return;
      }

      const gameModeValidation = validateGameMode(req.query.game_mode || 'story');
      if (!gameModeValidation.valid) {
        res.status(400).json({ 
          success: false,
          error: gameModeValidation.error 
        });
        return;
      }

      const limit = limitValidation.value!;
      const gameMode = gameModeValidation.value!;

      const leaderboard = await leaderboardService.getTopPlayers(
        gameMode,
        limit
      );

      const sanitizedLeaderboard = leaderboard.map(player => ({
        ...player,
        username: require('../utils/validation').escapeHtml(player.username),
      }));

      res.status(200).json({
        success: true,
        data: sanitizedLeaderboard,
        gameMode,
        limit,
      });
    } catch (error) {
      console.error('Error fetching top players:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

 
  async getPlayerRank(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userIdValidation = validateUserId(req.params.user_id);
      if (!userIdValidation.valid) {
        res.status(400).json({ 
          success: false,
          error: userIdValidation.error 
        });
        return;
      }

      const gameModeValidation = validateGameMode(req.query.game_mode || 'story');
      if (!gameModeValidation.valid) {
        res.status(400).json({ 
          success: false,
          error: gameModeValidation.error 
        });
        return;
      }

      const userId = userIdValidation.value!;
      const gameMode = gameModeValidation.value!;

      const rankData = await leaderboardService.getPlayerRank(userId, gameMode);

      if (!rankData) {
        res.status(404).json({
          success: false,
          error: 'Player not found in leaderboard',
          userId,
          gameMode,
        });
        return;
      }

      const sanitizedRankData = {
        ...rankData,
        username: require('../utils/validation').escapeHtml(rankData.username),
      };

      res.status(200).json({
        success: true,
        data: sanitizedRankData,
        gameMode,
      });
    } catch (error) {
      console.error('Error fetching player rank:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

