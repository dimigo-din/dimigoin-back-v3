import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import * as User from './user';
import { getOnlyDate } from '../resources/date';

const bookRequestSchema = createSchema({
  applier: Type.ref(Type.objectId({ required: true })).to('User', User.schema),
  date: Type.date({ required: true, default: getOnlyDate(new Date()) }),
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
