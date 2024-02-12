import cors from 'cors';
import express from 'express';
import { router } from './routes';
import { dbConnect, app, io, server } from 'src/config';
import path from 'path';

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

dbConnect().then(() => {
  console.log('DB connected');
});

app.get('*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

io.on('connection', (socket) => {
  socket.on('join', (conversationId: string | string[]) => {
    socket.join(conversationId);
  });
});

io.on('disconnect', () => {
  console.log('Disconnected');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});