import {
  createSchema, Type, typedModel,
} from 'ts-mongoose';

export const schema = createSchema({
  title: Type.string({ required: true, trim: true }),
  content: Type.string({ required: true, trim: true }),
  targetGrade: Type.array({ required: true }).of(Type.number()),
  startDate: Type.date({ required: true }),
  endDate: Type.date({ required: true }),
}, { versionKey: false, timestamps: true });

export const model = typedModel('Notice', schema);
