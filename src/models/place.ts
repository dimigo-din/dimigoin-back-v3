import {
  createSchema, Type, typedModel, ExtractDoc,
} from 'ts-mongoose';
import { PlaceType, PlaceBuildingType } from '../types';

const placeSchema = createSchema({
  name: Type.string({ required: true, trim: true, unique: true }),
  location: Type.string({ required: true, trim: true }),
  building: Type.string({ required: true, enum: Object.values(PlaceBuildingType), default: 'ETC' }),
  floor: Type.number({ require: false, default: 0 }),
  nick: Type.string({ require: true, trim: true }),
  description: Type.string({ trim: true }),
  type: Type.string({ required: true, enum: Object.values(PlaceType), default: 'ETC' }),
}, { versionKey: false, timestamps: true });

type PlaceDoc = ExtractDoc<typeof placeSchema>;

const PlaceModel = typedModel('Place', placeSchema);

export {
  placeSchema,
  PlaceModel,
  PlaceDoc, // eslint-disable-line
};
