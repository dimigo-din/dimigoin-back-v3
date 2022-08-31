import { createSchema, Type } from 'ts-mongoose';
import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { dalgeurakDB } from '../../resources/dalgeurakDB';

export interface ConvenienceCheckin extends Document {
  duration: {
    start: string;
    end: string;
  };
  breakfast: {
    date: string;
    student: ObjectId;
  }[];
  dinner: {
    date: string;
    student: ObjectId;
  }[];
}

const checkinObj = {
  date: Type.string(),
  student: Type.objectId(),
};

const convenienceCheckinSchema = createSchema({
  duration: Type.object({ required: true }).of({
    start: Type.string({ required: true }),
    end: Type.string({ required: true }),
  }),
  breakfast: Type.array({ default: [] }).of(checkinObj),
  dinner: Type.array({ default: [] }).of(checkinObj),
}, { versionKey: false, timestamps: true });

const ConvenienceCheckinModel: Model<ConvenienceCheckin> = dalgeurakDB.model('convenienceacheckin', convenienceCheckinSchema);

export {
  convenienceCheckinSchema,
  ConvenienceCheckinModel,
};
