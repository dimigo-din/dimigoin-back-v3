import {
  createSchema, Type, typedModel, ExtractDoc,
} from 'ts-mongoose';

export const schema = createSchema({
  name: Type.string({ required: true, trim: true, unique: true }),
  location: Type.string({ required: true, trim: true }),
  description: Type.string({ trim: true }),
}, { versionKey: false, timestamps: true });

export type doc = ExtractDoc<typeof schema>;

export const model = typedModel('Place', schema);
