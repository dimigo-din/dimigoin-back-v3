import { createSchema, Type } from 'ts-mongoose';
import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { dalgeurakDB } from '../../resources/dalgeurakDB';
import { userSchema } from '../user';

export interface ConvenienceDeprive extends Document {
  student: ObjectId;
  clear: boolean;
}

const convenienceDepriveSchema = createSchema({
  student: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
  clear: Type.boolean({ default: false }),
}, { versionKey: false, timestamps: false });

const ConvenienceDepriveModel: Model<ConvenienceDeprive> = dalgeurakDB.model('convenienceadeprive', convenienceDepriveSchema);

export {
  convenienceDepriveSchema,
  ConvenienceDepriveModel,
};
