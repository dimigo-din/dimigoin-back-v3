import mongoose from 'mongoose';
import config from '../config';

const mongooseOption = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

export const dalgeurakDB = mongoose.createConnection(config.dalgeurakMongoUri, mongooseOption);
