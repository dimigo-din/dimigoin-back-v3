import {
  createSchema, Type, typedModel, ExtractDoc,
} from 'ts-mongoose';
import { afterschoolSchema } from './afterschool';
import { userSchema } from './user';

const afterschoolApplicationSchema = createSchema({
  applier: Type.ref(Type.objectId()).to('User', userSchema),
  afterschool: Type.ref(Type.objectId()).to('Afterschool', afterschoolSchema),
}, { versionKey: false, timestamps: true });

const AfterschoolApplicationModel = typedModel('AfterschoolApplication', afterschoolApplicationSchema);
export type AfterschoolApplicationDoc = ExtractDoc<typeof afterschoolSchema>;

export {
  afterschoolApplicationSchema,
  AfterschoolApplicationModel,
};
