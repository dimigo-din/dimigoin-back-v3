import { createSchema, Type, typedModel } from 'ts-mongoose';
import { userSchema } from './user';

const fileSchema = createSchema({
  name: Type.string({ required: true, trim: true }),
  extension: Type.string({ required: true, trim: true }),
  owner: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
  // 최대 다운로드 횟수 (0일 경우 제한 없음)
  downloadLimit: Type.number({ required: true, default: 0 }),
}, { versionKey: false, timestamps: true });

const FileModel = typedModel('File', fileSchema);

export {
  fileSchema,
  FileModel,
};
