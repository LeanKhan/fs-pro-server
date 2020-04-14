import DB from '../db';

export function fetchAppearance() {
  return DB.db.collection('appearance').find({}).toArray();
}
