import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import { userSchema } from './User';
import { getOnlyDate } from '../resources/date';

const bookRequestSchema = createSchema({
  applier: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
  date: Type.date({ required: true, default: getOnlyDate() }),
  bookname: Type.string({ required: true }),
  bookauthor: Type.string({ required: true }),
  bookpublisher: Type.string({ required: true }),
  bookprice: Type.number({ required: true }),
}, { versionKey: false, timestamps: true });

  type BookRequestDoc = ExtractDoc<typeof bookRequestSchema>;

const bookRequestModel = typedModel('bookRequestModel', bookRequestSchema);

export {
  bookRequestSchema,
  bookRequestModel,
};
