import { createSchema, Type, typedModel } from 'ts-mongoose';

const tokenSchema = createSchema({
  userId: Type.number({ required: true }),
  tokens: Type.array({ select: false, default: [] }).of(Type.string()),
  dalgeurakToken: Type.array({ select: false, default: [] }).of(Type.string()),
}, { versionKey: false, timestamps: false });

const TokenModel = typedModel('Token', tokenSchema);
export {
  tokenSchema,
  TokenModel,
};
