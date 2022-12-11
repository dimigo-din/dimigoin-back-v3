import { createSchema, Type } from 'ts-mongoose';
import { Document, Model } from 'mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';

export interface ConvenienceBlacklist extends Document {
  userId: number;
}
const convenienceBlacklistScheme = createSchema({
  userId: Type.number({ required: true }),
}, { versionKey: false, timestamps: true });

const ConvenienceBlacklistModel: Model<ConvenienceBlacklist> = dalgeurakDB.model('convenienceblacklist', convenienceBlacklistScheme);

export {
  convenienceBlacklistScheme,
  ConvenienceBlacklistModel,
};
