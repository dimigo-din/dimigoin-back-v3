import { createSchema, Type } from 'ts-mongoose';
import { Document, Model } from 'mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';
import {
  ConvenienceFoodType,
  ConvenienceFoodValues,
  ConvenienceTimeType,
  ConvenienceTimeValues,
} from '../../types';

export interface ConvenienceFood extends Document {
  time: ConvenienceTimeType;
  limit: number;
  remain: number;
  food: ConvenienceFoodType;
  name: string;
  duration: {
    start: Date;
    end: Date;
    applicationend: Date;
  }
}

const convenienceFoodSchema = createSchema({
  time: Type.string({ required: true, enum: [...ConvenienceTimeValues] }),
  limit: Type.number({ max: 50, default: 50 }),
  remain: Type.number({ max: 50, default: 50 }),
  food: Type.string({ required: true, enum: [...ConvenienceFoodValues] }),
  name: Type.string({ required: true }),
  duration: Type.object({ required: true }).of({
    start: Type.date({ required: true }),
    end: Type.date({ required: true }),
    applicationend: Type.date({ required: true }),
  }),
}, { versionKey: false, timestamps: false });

const ConvenienceFoodModel: Model<ConvenienceFood> = dalgeurakDB.model('conveniencefood', convenienceFoodSchema);

export {
  convenienceFoodSchema,
  ConvenienceFoodModel,
};
