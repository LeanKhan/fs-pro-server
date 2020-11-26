import { Router } from 'express';
import { restPlayGame, restUpdateStandings } from './game.controller';

const router = Router();

router.get('/kickoff', restPlayGame, restUpdateStandings);

export default router;
