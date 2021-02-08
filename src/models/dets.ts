/* eslint-disable max-len */
import {
  createSchema, Type, typedModel, ExtractDoc,
} from 'ts-mongoose';
import { ObjectId } from 'mongodb';
import { userSchema } from './user';
import {
  TimeValues, DayValues, GradeValues,
} from '../types';
import { DetsApplicationModel } from './dets-application';

const detsSchema = createSchema({
  title: Type.string({ required: true, unique: true, trim: true }),
  description: Type.string({ required: true }),
  startDate: Type.date({ required: true }),
  endDate: Type.date({ required: true }),
  requestEndDate: Type.date({ required: true }),
  time: Type.array().of(Type.string({ required: true, enum: TimeValues })),
  speakerID: Type.ref(Type.objectId()).to('User', userSchema),
  day: Type.array().of(Type.string({ required: true, enum: DayValues })),
  room: Type.string({ required: true }), // add room type validation
  maxcount: Type.number({ required: true }),
  targetGrade: Type.array().of(Type.number({ required: true, enum: GradeValues })),
  imageUrl: Type.string({ required: true }),
  count: Type.number({ required: true }),
}, { versionKey: false, timestamps: true });

  type DetsDocs = ExtractDoc<typeof detsSchema>;

const DetsModel = typedModel('Dets', detsSchema, undefined, undefined, {
  async checkOverlap(applierId: ObjectId, targetId: ObjectId): Promise<Boolean> {
    // const target = await DetsModel.findById(targetId);
    // return !!(await DetsApplicationModel
    //   .find({ applier: applierId })
    //   .populateTs('dets'))
    //   .filter(({ dets }) => (
    //     dets.dets === target._id
    //       || (
    //         dets.day.filter((day) => target.day.includes(day)).length
    //         && dets.time.filter((time) => target.time.includes(time)).length
    //       )
    //   ));
    const isDuplicatedApplication = !!await DetsApplicationModel.countDocuments({ applier: applierId, dets: targetId });
    return isDuplicatedApplication;
  },
});

export {
  detsSchema,
  DetsModel,
};
