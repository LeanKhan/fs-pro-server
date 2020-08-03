import { Router } from 'express';
import { getClubs, Game } from '../game.controller';
import respond from '../../helpers/responseHandler';
import { io } from '../../server';
import {
  initiateGame,
  restPlayGame,
  restUpdateStandings,
} from './game.controller';

const router = Router();

router.post('/play', async (req, res) => {
  //   const response = fetchOneById(req.params.id);
  const clubs = req.body.clubs || ['RP', 'IB'];

  const sides = req.body.sides;

  console.log('clubs => ', clubs)

  const game = (await getClubs(clubs, sides)) as Game;

  // game.getMatch().Events.forEach((event) => {
  //   setTimeout(() => {
  //     io.emit('match-event', event);
  //   }, 1200);
  // });

  // io.emit('match-ended', {
  //   details: game.getMatch().Details,
  //   home: game.getMatch().Home.ClubCode,
  //   away: game.getMatch().Away.ClubCode,
  // });

  respond.success(res, 200, 'Match played');
});

router.get('/kickoff', restPlayGame, restUpdateStandings);

router.post('/new-game', initiateGame);

export default router;
