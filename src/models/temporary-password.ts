import { createSchema, Type, typedModel } from 'ts-mongoose';

const temporaryPasswordSchema = createSchema({
  user: Type.objectId({ required: true }),
  status: Type.boolean({ required: false }),
  password: Type.string({ required: false }),
  salt: Type.string({ required: false }),
  code: Type.string({ requre: false }),
}, { versionKey: false, timestamps: true });

const TemporaryPasswordModel = typedModel('TemporaryPassword', temporaryPasswordSchema);
export {
  temporaryPasswordSchema,
  TemporaryPasswordModel,
};
