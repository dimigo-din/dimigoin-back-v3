import {
  createSchema, Type, typedModel, ExtractDoc,
} from 'ts-mongoose';
import { PlaceType } from '../types';

const userLatestPlaceSchema = createSchema({
  userId: Type.objectId({ required: true, unique: true }),
  location: Type.string({ required: true, trim: true }),
  description: Type.string({ trim: true }),
  type: Type.string({ required: true, enum: Object.values(PlaceType), default: 'ETC' }),
}, { versionKey: false, timestamps: true });

  type userLatestPlaceDocs = ExtractDoc<typeof userLatestPlaceSchema>;

const userLatestPlaceModel = typedModel('userLatestPlace', userLatestPlaceSchema);

export {
  userLatestPlaceSchema,
  userLatestPlaceModel,
    userLatestPlaceDocs, // eslint-disable-line
};
