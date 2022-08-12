import { createSchema, Type } from 'ts-mongoose';
import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { dalgeurakDB } from '../../resources/dalgeurakDB';
import { userSchema } from '../user';
import { convenienceFoodSchema } from './convenience-food';
import {
  ConvenienceTimeType,
  ConvenienceTimeValues,
} from '../../types';

export interface ConvenienceCheckin extends Document {
  student: ObjectId;
  food: ObjectId;
  time: ConvenienceTimeType;
  date: string;
}

const convenienceCheckinSchema = createSchema({
  student: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
  food: Type.ref(Type.objectId({ required: true })).to('conveniencefood', convenienceFoodSchema),
  time: Type.string({ required: true, enum: ConvenienceTimeValues }),
  date: Type.string({ required: true }),
}, { versionKey: false, timestamps: false });

const ConvenienceCheckinModel: Model<ConvenienceCheckin> = dalgeurakDB.model('convenienceacheckin', convenienceCheckinSchema);

export {
  convenienceCheckinSchema,
  ConvenienceCheckinModel,
};
