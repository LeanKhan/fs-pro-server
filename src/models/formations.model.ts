import mongoose, {Schema} from 'mongoose';

const FormationsSchema:Schema = new Schema({
    Name: String,
    Code: String,
    GridLayout: Array
});

export default mongoose.model('Formation', FormationsSchema, 'Formations');