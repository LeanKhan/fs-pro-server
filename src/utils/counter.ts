import mongoose from 'mongoose';

// Find the Counter of the

export const incrementCounter = (counterName: string) => {
  mongoose.connection.db.collection('counter').findOneAndUpdate(
    { _id: counterName },
    {
      $inc: { sequence_value: 1 }
    }
  );
};
