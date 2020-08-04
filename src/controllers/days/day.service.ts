import DB from '../../db';

export function createMany(days: any[]) {
  return DB.Models.Day.insertMany(days, { ordered: true });
}
