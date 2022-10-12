import { createSchema, Type } from 'ts-mongoose';
import { Document, Model } from 'mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';

export interface ConvenienceDeprive extends Document {
  student: number;
  clear: boolean;
}

const convenienceDepriveSchema = createSchema({
  student: Type.number({ required: true }),
  clear: Type.boolean({ default: false }),
}, { versionKey: false, timestamps: true });

const ConvenienceDepriveModel: Model<ConvenienceDeprive> = dalgeurakDB.model('convenienceadeprive', convenienceDepriveSchema);

export {
  convenienceDepriveSchema,
  ConvenienceDepriveModel,
};
