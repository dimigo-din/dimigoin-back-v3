import { ObjectId } from 'mongodb';
import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import { ConfigKeys } from '../types';
import * as Config from './config';
import * as User from './user';

export const schema = createSchema({
  name: Type.string({ required: true, unique: true, trim: true }),
  imageKey: Type.string({ required: true }),
  description: Type.string({ required: true }),
  chair: Type.ref(Type.objectId()).to('User', User.schema),
  viceChair: Type.ref(Type.objectId()).to('User', User.schema),
  videoLink: Type.string({ required: true }),
  category: Type.string({
    required: true,
    validate: async (value: string) => {
      const { value: category } =
        await Config.model.findOne({ key: ConfigKeys.circleCategory });
      return category.includes(value);
    },
  }),
  applied: Type.boolean({ required: true, default: false }),
}, { versionKey: false, timestamps: true });

export type doc = ExtractDoc<typeof schema>;

export const model = typedModel('Circle', schema);

const findByChair = async (chair: ObjectId): Promise<doc> => {
  return await model.findOne({ chair });
};

const findByViceChair = async (viceChair: ObjectId): Promise<doc> => {
  return await model.findOne({ viceChair });
};

const findByChairs = async (user: ObjectId): Promise<doc> => {
  return model.findOne({ $or: [{ chair: user }, { viceChair: user }] });
};

export {
  findByChair,
  findByViceChair,
  findByChairs,
}
