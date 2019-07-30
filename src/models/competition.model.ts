import mongoose, {Schema, Document} from 'mongoose';

export interface Competition extends Document {
    Type: string,
    Title: string,
    League: boolean,
    Tournament: boolean,
    NumberOfTeams: number,
    Teams: [],
    Seasons: []
}

const Competition: Schema = new Schema({
    Type: {
        type: String,
        required: true
    },
    Title: String,
    League: Boolean,
    Tournament: Boolean,
    NumberOfTeams: Number,
    Teams: [{type: mongoose.Schema.Types.ObjectId, ref: 'Club'}],
    Seasons: [{type: mongoose.Schema.Types.ObjectId, ref: 'Season'}],
}, {timestamps: true});

export default mongoose.model<Competition>('Competition', Competition, 'Competitions');
