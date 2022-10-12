import { createSchema, Type, typedModel } from 'ts-mongoose';
import { detsSchema } from './dets';

const detsApplicationSchema = createSchema({
  applier: Type.number({ required: true }),
  dets: Type.ref(Type.objectId()).to('Dets', detsSchema),
}, { versionKey: false, timestamps: true });

const DetsApplicationModel = typedModel('DetsApplication', detsApplicationSchema);

export {
  detsApplicationSchema,
  DetsApplicationModel,
};
