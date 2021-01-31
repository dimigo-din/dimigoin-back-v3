import { ObjectId } from 'mongodb';
import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import { CircleApplicationStatusValues } from '../types';
import * as Circle from './circle';
import * as User from './user';

export const schema = createSchema({
  applier: Type.ref(Type.objectId()).to('User', User.schema),
  form: Type.mixed({ required: true }),
  circle: Type.ref(Type.objectId()).to('Circle', Circle.schema),
  status: Type.string({
    required: true,
    default: 'applied',
    enum: CircleApplicationStatusValues,
  }),
}, { versionKey: false, timestamps: true });

export type doc = ExtractDoc<typeof schema>;

export const model = typedModel('CircleApplication', schema);

const findByApplier = async (applier: ObjectId): Promise<doc[]> => {
  return await model.find({ applier });
};

const findPopulatedByCircle = async (circle: ObjectId): Promise<doc[]> => {
  return await model.find({ circle }).populate('applier', ['name', 'serial', 'photo']);
};

const findByCircle = async (circle: ObjectId): Promise<doc[]> => {
  return await model.find({ circle });
};

const findByCircleApplier = async (circle: ObjectId, applier: ObjectId): Promise<doc> => {
  return await model.findOne({ circle, applier });
};

export {
  findByApplier,
  findPopulatedByCircle,
  findByCircle,
  findByCircleApplier,
};
