import { Router } from 'express';
import { restPlayGame, restUpdateStandings } from './game.controller';

const router = Router();

router.get('/kickoff/:fixture', restPlayGame, restUpdateStandings);

export default router;
