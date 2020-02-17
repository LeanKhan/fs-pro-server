import express from 'express';
import clubRouter from '../controllers/clubs/club.router';
import playerRouter from '../controllers/players/player.router';
import competitionRouter from '../controllers/competitions/competition.router';
import userRouter from './user.router';
import { fileRouter } from '../services/file/file.service';

const router = express.Router();

router.use('/clubs', clubRouter);

router.use('/players', playerRouter);

router.use('/competitions', competitionRouter);

router.use('/users', userRouter);

router.use('/files', fileRouter);

export default router;
