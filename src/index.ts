import dotenv from 'dotenv';
import { createServer } from 'http';
import socketIO, { Socket } from 'socket.io';
import App from './app';
import config from './config';
import logger from './resources/logger';
// const { app } = new App();

// app
//   .listen(port, () => {
//     logger.info(`Server listening on port ${port}`);
//   })
//   .on('error', (error) => {
//     logger.error(error);
//   });

dotenv.config();

const port: number = parseInt(config.port) || 5000;

const { app } = new App();
const httpServer = createServer(app);
const io = new socketIO.Server(httpServer);

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

httpServer
  .listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  })
  .on('error', (error) => {
    logger.error(error);
  });
