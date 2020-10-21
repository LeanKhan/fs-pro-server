import { Router } from 'express';
import clubRouter from '../controllers/clubs/club.router';
import playerRouter from '../controllers/players/player.router';
import competitionRouter from '../controllers/competitions/competition.router';
import seasonRouter from '../controllers/seasons/season.router';
import userRouter from '../controllers/user/user.router';
import gameRouter from '../controllers/game/game.router';
import calendarRouter from '../controllers/calendar/calendar.router';
import { fileRouter } from '../services/file/file.service';
import managers from '../controllers/managers/manager.router';

const router = Router();

router.use('/clubs', clubRouter);

router.use('/players', playerRouter);

router.use('/competitions', competitionRouter);

router.use('/users', userRouter);

router.use('/seasons', seasonRouter);

router.use('/calendar', calendarRouter);

router.use('/files', fileRouter);

router.use('/game', gameRouter);

router.use('/managers', managers);

export default router;
