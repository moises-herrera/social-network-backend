import cors from 'cors';
import express from 'express';
import { router } from './routes';
import dbConnect from './config/db';
import { configCloudinary } from './config/cloudinary';
import multer from 'multer';

const PORT = process.env.PORT || 3000;

const app = express();
const upload = multer({ storage: multer.memoryStorage() });


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.single('avatar'));

app.use(router);

configCloudinary();

dbConnect().then(() => {
  console.log('DB connected');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
