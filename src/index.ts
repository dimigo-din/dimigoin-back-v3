import dotenv from 'dotenv';
import App from './App';
import config from './config';

dotenv.config();

const port: number = Number(config.port) || 5000;
const { app } = new App();

app
  .listen(port, () => console.log(`Server is listening at ${port}`))
  .on('error', (error) => console.error(error));
