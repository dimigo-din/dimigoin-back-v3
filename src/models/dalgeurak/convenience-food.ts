import { createSchema, Type } from 'ts-mongoose';
import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
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
  applications: {
    date: string;
    student: ObjectId;
  }[];
  duration: {
    start: string;
    end: string;
    applicationend: string;
  }
}

const convenienceFoodSchema = createSchema({
  time: Type.string({ required: true, enum: [...ConvenienceTimeValues] }),
  limit: Type.number({ max: 50, default: 50 }),
  remain: Type.number({ max: 50, default: 50 }),
  food: Type.string({ required: true, enum: [...ConvenienceFoodValues] }),
  name: Type.string({ required: true }),
  applications: Type.array({ default: [] }).of({
    date: Type.string(),
    student: Type.objectId(),
  }),
  duration: Type.object({ required: true }).of({
    start: Type.string({ required: true }),
    end: Type.string({ required: true }),
    applicationend: Type.string({ required: true }),
  }),
}, { versionKey: false, timestamps: true });

const ConvenienceFoodModel: Model<ConvenienceFood> = dalgeurakDB.model('conveniencefood', convenienceFoodSchema);

export {
  convenienceFoodSchema,
  ConvenienceFoodModel,
};
