import dotenv from 'dotenv';
import express from 'express';
import App from './app';

dotenv.config({ path: '../.env' });

const port: number = Number(process.env.SERVER_PORT) || 5000;
const app: express.Application = new App().app;

app.listen(port, () => console.log(`Server is listening at ${port}`))
  .on('error', (error) => console.error(error));
