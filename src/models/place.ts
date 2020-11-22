import { createSchema, Type, typedModel } from 'ts-mongoose';

const placeSchema = createSchema({
  name: Type.string({ required: true, trim: true }),
  location: Type.string({ required: true, trim: true }),
  description: Type.string({ required: true, trim: true }),
}, { versionKey: false, timestamps: true });

const PlaceModel = typedModel('Place', placeSchema);

export {
  placeSchema,
  PlaceModel,
};
