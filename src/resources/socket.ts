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
  let currentRoom: string | null = null;
  console.log('connected');

  socket.on('mealStatus', (data) => {
    socket.join('mealStatus');
    currentRoom = 'mealStatus';
  });
  socket.on('mealStatusTest', (data) => {
    console.log(data);
    console.log(currentRoom);
    socket.emit('event', { ...data, success: true });
  });
});

export default io;
