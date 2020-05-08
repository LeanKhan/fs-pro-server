import { Router, Request, Response } from 'express';
import { getClubs, Game } from '../game.controller';
import respond from '../../helpers/responseHandler';
import { io } from '../../server';

const router = Router();

router.post('/play', async (req, res) => {
  //   const response = fetchOneById(req.params.id);

  const game = (await getClubs()) as Game;

  game.getMatch().Events.forEach((event) => {
    setTimeout(() => {
      io.emit('match-event', event);
    }, 1200);
  });

  io.emit('match-ended', {
    details: game.getMatch().Details,
    home: game.getMatch().Home.ClubCode,
    away: game.getMatch().Away.ClubCode,
  });

  respond.success(res, 200, 'Match played');
});

export default router;
