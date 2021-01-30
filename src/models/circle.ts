import { ObjectId } from 'mongodb';
import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import { ConfigKeys } from '../types';
import { ConfigModel } from './config';
import * as User from './user';

const circleSchema = createSchema({
  name: Type.string({ required: true, unique: true, trim: true }),
  imageKey: Type.string({ required: true }),
  description: Type.string({ required: true }),
  chair: Type.ref(Type.objectId()).to('User', User.schema),
  viceChair: Type.ref(Type.objectId()).to('User', User.schema),
  videoLink: Type.string({ required: true }),
  category: Type.string({
    required: true,
    validate: async (value: string) => {
      const { value: category } = await ConfigModel.findOne({ key: ConfigKeys.circleCategory });
      return category.includes(value);
    },
  }),
  applied: Type.boolean({ required: true, default: false }),
}, { versionKey: false, timestamps: true });

type CircleDoc = ExtractDoc<typeof circleSchema>;

const CircleModel = typedModel('Circle', circleSchema, undefined, undefined, {
  findByChair(chair: ObjectId): CircleDoc {
    return this.findOne({ chair });
  },
  findByViceChair(viceChair: ObjectId): CircleDoc {
    return this.findOne({ viceChair });
  },
  findByChairs(user: ObjectId): CircleDoc {
    return this.findOne({ $or: [{ chair: user }, { viceChair: user }] });
  },
});

export {
  circleSchema,
  CircleModel,
};
