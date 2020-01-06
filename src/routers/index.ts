import express from 'express';
import clubRouter from './club.router';
import playerRouter from './player.router';
import userRouter from './user.router';
import { fileRouter } from '../services/file/file.service';

const router = express.Router();

router.use('/clubs', clubRouter);

router.use('/players', playerRouter);

router.use('/users', userRouter);

router.use('/files', fileRouter);

export default router;
