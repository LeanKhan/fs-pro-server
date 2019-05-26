import express from 'express';

const app: express.Application = express();

app.get('/', (req, res) => {
  res.status(200).send('Welcome! To FS-PRO Game Server');
});

app.listen('6000', () => {
  console.log('Game Server running successfully!');
});
