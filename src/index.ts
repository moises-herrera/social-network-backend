import cors from 'cors';
import express from 'express';
import { router } from './routes';
import dbConnect from './config/db';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);

dbConnect().then(() => {
  console.log('DB connected');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
