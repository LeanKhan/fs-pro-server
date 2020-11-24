import { Router } from 'express';
import respond from '../../helpers/responseHandler';

const router = Router();

// Fetch all countries...
// TODO: use a database and all that.

const countries: string[] = [
  'Ashter',
  'Bellean',
  'UPP',
  'Kev',
  'Simeon',
  'Kiyoto',
  'Ekhastan',
  'Huntaarland',
  'Legardio',
  'Stov',
  'Proland',
  'Pregge',
];

router.get('/', (req, res) => {
  respond.success(res, 200, 'Countries', countries);
});

export default router;
