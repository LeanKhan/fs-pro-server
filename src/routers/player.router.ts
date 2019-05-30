import express from 'express';
import playerModel, {Player} from '../models/player.model';

const playerRouter = express.Router();

playerRouter.post('/new', (req,res)=>{
    const player:Player = req.body;
    const p = new playerModel(player);

    p.save();
});




