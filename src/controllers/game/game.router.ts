import { Router } from 'express';
import { restPlayGame, restUpdateStandings, restPlayGameNew } from './game.controller';

const router = Router();

router.get('/kickoff/:fixture', restPlayGame, restUpdateStandings);

router.get('/kickoff-new/:fixture', restPlayGameNew);

export default router;
