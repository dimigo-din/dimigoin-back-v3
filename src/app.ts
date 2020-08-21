import express from 'express';
import mongoose from 'mongoose';

import bodyParser from 'body-parser';
import cors from 'cors';
import bearerToken from 'express-bearer-token';
import fileUpload from 'express-fileupload';
import helmet from 'helmet';
import { attachUserInfo, errorHandler } from './middlewares';
import routes from './routes';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.connectMongoDB();
    this.initializeRouter();
    this.initializeErrorhandlers();
  }

  private initializeRouter() {
    const router: express.Router = express.Router();
    routes.forEach((route) => {
      this.app.use(route.basePath, route.router);
    });
    this.app.use(router);
  }

  private initializeMiddlewares() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(fileUpload());

    this.app.use(bearerToken({
      headerKey: 'Bearer',
      reqKey: 'token',
    }));
    this.app.use(attachUserInfo);
  }

  private initializeErrorhandlers() {
    this.app.use(errorHandler);
  }

  // eslint-disable-next-line class-methods-use-this
  private connectMongoDB() {
    const { MONGO_URI: mongoURI } = process.env;
    const mongooseOption = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    };
    mongoose.connect(mongoURI, mongooseOption);
  }
}

export default App;
