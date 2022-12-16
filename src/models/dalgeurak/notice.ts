import { Model, Document } from 'mongoose';
import { createSchema, Type } from 'ts-mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';

interface INotice extends Document {
  message: string;
}

const noticeSchema = createSchema({
  message: Type.string({ required: true }),
}, { versionKey: false, timestamps: false });

const NoticeModel: Model<INotice> = dalgeurakDB.model('notice', noticeSchema);

export {
  noticeSchema,
  NoticeModel,
};
