import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import { userSchema } from './User';
import { getOnlyDate } from '../resources/date';

const bookRequestSchema = createSchema({
  applier: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
  date: Type.date({ required: true, default: getOnlyDate() }),
  name: Type.string({ required: true }),
  author: Type.string({ required: true }),
  publisher: Type.string({ required: true }),
  price: Type.number({ required: true }),
}, { versionKey: false, timestamps: true });

type BookRequestDoc = ExtractDoc<typeof bookRequestSchema>;

const BookRequestModel = typedModel('bookRequestModel', bookRequestSchema);

export {
  bookRequestSchema,
  BookRequestModel,
};
