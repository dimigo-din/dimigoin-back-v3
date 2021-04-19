import {
  createSchema, Type, typedModel, ExtractDoc,
} from 'ts-mongoose';

const userLatestPlaceSchema = createSchema({
  userId: Type.objectId({ required: true, unique: true }),
  placeId: Type.objectId({ required: true }),
  description: Type.string({ trim: true }),
}, { versionKey: false, timestamps: true });

  type userLatestPlaceDocs = ExtractDoc<typeof userLatestPlaceSchema>;

const userLatestPlaceModel = typedModel('userLatestPlace', userLatestPlaceSchema);

export {
  userLatestPlaceSchema,
  userLatestPlaceModel,
    userLatestPlaceDocs, // eslint-disable-line
};
