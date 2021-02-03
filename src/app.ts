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
import {
  ConfigKeys, CirclePeriod, Grade, Class,
} from './types';
import { PlaceModel } from './models';

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
    const defaultConfigs: { [key: string]: any } = {
      [ConfigKeys.circlePeriod]: CirclePeriod.application,
      [ConfigKeys.circleMaxApply]: 3,
      [ConfigKeys.circleCategory]: ['IT(프로젝트)', '음악', '경영'],
      [ConfigKeys.imageExtension]: ['png', 'jpg', 'jpeg', 'heif'],
      [ConfigKeys.weeklyIngangTicketCount]: 6,
      [ConfigKeys.ingangMaxAppliers]: [0, 8, 6, 0],
    };

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

    const places = [
      { name: '비즈쿨실', location: '본관 1층' },
      { name: '안정실', location: '본관 1층' },
      { name: '큐브', location: '본관 2층' },
      { name: '시청각실', location: '신관 1층' },
      { name: '세미나실', location: '신관 1층' },
      { name: '학봉관', location: '학봉관' },
      { name: '우정학사', location: '우정학사' },
      { name: '영어 전용 교실', location: '신관 1층' },
      { name: '열람실', location: '신관 3층' },
    ].map((p) => ({ ...p, type: 'ETC' }));

    const getClassLocation = (grade: Grade, klass: Class) => {
      if (grade === 3) return '신관 2층';
      if (grade === 2) return '본관 2층';
      if (klass <= 4) return '본관 1층';
      return '본관 2층';
    };

    // 교실 추가
    for (let grade = 1; grade <= 3; grade += 1) {
      for (let klass = 1; klass <= 6; klass += 1) {
        places.push({
          name: `${grade}학년 ${klass}반`,
          location: getClassLocation(
            grade as Grade,
            klass as Class,
          ),
          type: 'CLASSROOM',
        });
      }
    }

    await Promise.all(
      places
        .filter((p) => !registeredPlaces.find((r) => r.name === p.name))
        .map((p) => new PlaceModel(p).save()),
    );
  }

  private async initializeCronJobs() {
    await setCronJobsAndRun();
  }
}

export default App;
