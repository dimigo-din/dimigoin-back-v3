import {
  createSchema, Type, typedModel,
} from 'ts-mongoose';

export const schema = createSchema({
  question: Type.string({ required: true, trim: true, unique: true }),
  maxLength: Type.number({ required: true }),
}, { versionKey: false, timestamps: true });

export const model = typedModel('CircleApplicationQuestion', schema);
