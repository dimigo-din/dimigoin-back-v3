import dotenv from 'dotenv';
import App from './App';
// eslint-disable-next-line
import express from 'express';

dotenv.config();

const port: number = Number(process.env.SERVER_PORT) || 5000;
const { app } = new App();

app
  .listen(port, () => console.log(`Server is listening at ${port}`))
  .on('error', (error) => console.error(error));
