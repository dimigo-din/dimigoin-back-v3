import express from 'express';
import mongoose from 'mongoose';

import bodyParser from 'body-parser';
import cors from 'cors';
import bearerToken from 'express-bearer-token';
import fileUpload from 'express-fileupload';
import helmet from 'helmet';

import { attachUserInfo, errorHandler } from './middlewares';
import routes from './routes';
import config from './config';

// Defualt Setting
import { ConfigModel } from './models/config';
import { ConfigKeys, CirclePeriod } from './types';
import { PlaceModel, PlaceDoc } from './models';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.connectMongoDB();
    this.initializeRouter();
    this.initializeErrorhandlers();
    this.initializeSettings();
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

    const places: Array<PlaceDoc> = [
      new PlaceModel({ name: '비즈쿨실', location: '본관 1층' }),
      new PlaceModel({ name: '안정실', location: '본관 1층' }),
      new PlaceModel({ name: '큐브', location: '본관 2층' }),
      new PlaceModel({ name: '시청각실', location: '신관 1층' }),
      new PlaceModel({ name: '세미나실', location: '신관 1층' }),
      new PlaceModel({ name: '학봉관', location: '학봉관' }),
      new PlaceModel({ name: '우정학사', location: '우정학사' }),
      new PlaceModel({ name: '영어 전용 교실', location: '신관 1층' }),
    ];

    // 교실 추가
    for (let grade = 1; grade <= 3; grade += 1) {
      for (let klass = 1; klass <= 6; klass += 1) {
        places.push(new PlaceModel({
          name: `${grade}학년 ${klass}반`,
          location: (() => {
            if (grade === 3) return '신관 2층';
            if (grade === 2) return '본관 2층';
            if (klass <= 4) return '본관 1층';
            return '본관 2층';
          })(),
          description: '교실'
        }))
      }
    }

    await Promise.all(
      places
        .filter((p) => !registeredPlaces.find((r) => r.name === p.name))
        .map((p) => p.save())
    );    
  }
}

export default App;
