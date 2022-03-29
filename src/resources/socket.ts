import { createServer } from 'http';
import socketIO, { Socket } from 'socket.io';
import express from 'express';

const app = express();
export const serverSocket = createServer(app);

const io = new socketIO.Server(serverSocket, {
  cors: {
    credentials: true,
  },
});

io.of('/dalgeurak').on('connection', (socket: Socket) => {
  console.log('connected');

  socket.on('mealStatusJoinRoom', (data) => {
    socket.join('mealStatus');
  });
  socket.on('mealStatusTest', (data) => {
    socket.emit('event', { ...data, success: true });
  });
});

export default io;
