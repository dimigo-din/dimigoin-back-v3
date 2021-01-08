import { createSchema, Type, typedModel, ExtractDoc } from 'ts-mongoose';

const placeSchema = createSchema({
  name: Type.string({ required: true, trim: true, unique: true }),
  location: Type.string({ required: true, trim: true }),
  description: Type.string({ trim: true }),
}, { versionKey: false, timestamps: true });

const PlaceModel = typedModel('Place', placeSchema);
type PlaceDoc = ExtractDoc<typeof placeSchema>;

export {
  placeSchema,
  PlaceModel,
  PlaceDoc,
};
