import express from 'express';
import clubRouter from './club.router';
import playerRouter from './player.router';
import userRouter from './user.router';

const router = express.Router();

router.use('/clubs', clubRouter);

router.use('/players', playerRouter);

router.use('/users', userRouter);

export default router;
