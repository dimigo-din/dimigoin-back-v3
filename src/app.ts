import express from 'express';
import mongoose from 'mongoose';

import cors from 'cors';
import bearerToken from 'express-bearer-token';
import helmet from 'helmet';

import { attachUserInfo, errorHandler } from './middlewares';
import { serviceRouter, serviceDocsRouter } from './services';
import config from './config';

import { setCronJobsAndRun } from './resources/cron';

// Defualt Setting
import { ConfigModel } from './models/config';
import { ConfigKeys } from './types';
import { PlaceModel } from './models';
import { defaultPlaces, defaultConfigs } from './resources/default';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.connectMongoDB();
    this.initializeRouter();
    this.initializeErrorHandlers();
    this.initializeSettings();
    this.initializeCronJobs();
  }

  private initializeRouter() {
    this.app.use('/', serviceRouter);
    this.app.use('/docs', serviceDocsRouter);
  }

  private initializeMiddlewares() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());

    this.app.use(bearerToken({
      headerKey: 'Bearer',
      reqKey: 'token',
    }));
    this.app.use(attachUserInfo);
  }

  private initializeErrorHandlers() {
    this.app.use(errorHandler);
  }

  private connectMongoDB() {
    const { mongoUri } = config;
    const mongooseOption = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    };
    mongoose.connect(mongoUri, mongooseOption);
  }

  private async initializeSettings() {
    await this.initializeConfigs();
    await this.initializePlaces();
  }

  private async initializeConfigs() {
    const keys = Object.values(ConfigKeys);
    const configDocs = await ConfigModel.find({});

    /* eslint-disable */
    for (const key of keys) {
      if (configDocs.find((d) => d.key === key)) continue;
      await new ConfigModel({
        key,
        value: defaultConfigs[key],
      }).save();
    }
    /* eslint-enable */
  }

  private async initializePlaces() {
    const registeredPlaces = await PlaceModel.find({});

    await Promise.all(
      defaultPlaces
        .filter((p) => !registeredPlaces.find(
          (r) => r.name === p.name,
        ))
        .map((p) => new PlaceModel(p).save()),
    );
  }

  private async initializeCronJobs() {
    await setCronJobsAndRun();
  }
}

export default App;
