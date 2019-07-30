import express from 'express';
import  clubRouter from './club.router';
import playerRouter from './player.router';


const router = express.Router();

router.use('/clubs', clubRouter);

router.use('/players', playerRouter);

export default router;
