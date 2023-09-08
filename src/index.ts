import cors from 'cors';
import express from 'express';
import { router } from './routes';
import dbConnect from './config/db';
import { configCloudinary } from './config/cloudinary';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

configCloudinary();

dbConnect().then(() => {
  console.log('DB connected');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
