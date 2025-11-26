import { Router } from 'express';
import { LeaderboardController } from '../controllers/LeaderboardController';

const router = Router();
const leaderboardController = new LeaderboardController();

router.post('/submit', (req, res) => leaderboardController.submitScore(req, res));
router.get('/top', (req, res) => leaderboardController.getTopPlayers(req, res));
router.get('/rank/:user_id', (req, res) => leaderboardController.getPlayerRank(req, res));

export default router;

