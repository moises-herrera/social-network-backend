import { createServer } from 'http';
import { Server } from 'socket.io';
import { app } from '.';

const server = createServer(app);

export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.listen(4000);
