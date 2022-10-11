import { createSchema, Type, typedModel } from 'ts-mongoose';
import { afterschoolSchema } from './afterschool';

const afterschoolApplicationSchema = createSchema({
  applier: Type.number({ required: true }),
  afterschool: Type.ref(Type.objectId()).to('Afterschool', afterschoolSchema),
}, { versionKey: false, timestamps: true });

const AfterschoolApplicationModel = typedModel('AfterschoolApplication', afterschoolApplicationSchema);

export {
  afterschoolApplicationSchema,
  AfterschoolApplicationModel,
};
