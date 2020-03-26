import DB from '../db';

export function incrementCounter(counterName: string) {
  DB.db.collection('counter').findOneAndUpdate(
    { _id: counterName },
    {
      $inc: { sequence_value: 1 },
    }
  );
}
