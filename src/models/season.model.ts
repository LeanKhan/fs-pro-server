import mongoose, {Schema, Document, Mongoose} from 'mongoose';
import { IPlayerStats } from '../interfaces/Player';

export interface ISeason {
    SeasonID: string;
    SeasonCode: string;
    SeasonTitle: string;
    CompetitionCode: string;
    Fixtures: [];
    Standings: [];
    PlayerStats: PlayerSeasonStats[]
}

interface SeasonModel extends ISeason, Document {
    _id: string
}

export interface PlayerSeasonStats extends IPlayerStats {
    MOTM: number
}

const Season: Schema = new Schema({
    SeasonID: {type: String, unique: true},
    SeasonCode: {type: String},
    SeasonTitle: String,
    Competition: {type: mongoose.Schema.Types.ObjectId, ref: 'Competition'},
    Fixtures: {type: mongoose.Schema.Types.ObjectId, ref: 'Match'},
    Standings: {type: Array},
    PlayerStats: []
}, {timestamps: true});

export default mongoose.model<SeasonModel>('Season', Season, 'Seasons');
