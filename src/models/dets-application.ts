import { createSchema, Type, typedModel } from 'ts-mongoose';
import { detsSchema } from './dets';
import { userSchema } from './user';

const detsApplicationSchema = createSchema({
  applier: Type.ref(Type.objectId()).to('User', userSchema),
  dets: Type.ref(Type.objectId()).to('Dets', detsSchema),
}, { versionKey: false, timestamps: true });

const DetsApplicationModel = typedModel('DetsApplication', detsApplicationSchema);

export {
  detsApplicationSchema,
  DetsApplicationModel,
};
