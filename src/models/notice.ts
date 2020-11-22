import {
  createSchema, Type, typedModel,
} from 'ts-mongoose';

const noticeSchema = createSchema({
  title: Type.string({ required: true, trim: true }),
  content: Type.string({ required: true, trim: true }),
  targetGrade: Type.array({ required: true }).of(Type.number()),
  startDate: Type.date({ required: true }),
  endDate: Type.date({ required: true }),
}, { versionKey: false, timestamps: true });

const NoticeModel = typedModel('Notice', noticeSchema);

export {
  noticeSchema,
  NoticeModel,
};
