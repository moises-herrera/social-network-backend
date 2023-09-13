import cors from 'cors';
import express from 'express';
import { router } from './routes';
import dbConnect from './config/db';
import { configCloudinary } from './config/cloudinary';
import path from 'path';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

configCloudinary();

dbConnect().then(() => {
  console.log('DB connected');
});

app.get('*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
