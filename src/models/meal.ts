import {
  createSchema, Type, typedModel,
} from 'ts-mongoose';

export const schema = createSchema({
  date: Type.date({ required: true, unique: true }),
  breakfast: Type.array({ required: true }).of(Type.string()),
  lunch: Type.array({ required: true }).of(Type.string()),
  dinner: Type.array({ required: true }).of(Type.string()),
}, { versionKey: false, timestamps: true });

export const model = typedModel('Meal', schema);
