import {
  createSchema, Type, typedModel, ExtractDoc,
} from 'ts-mongoose';
import { ObjectId } from 'mongodb';
import { userSchema } from './user';
import {
  AfterschoolTimeValues, ClassValues, DayValues, GradeValues,
} from '../types';
import { AfterschoolApplicationModel } from './afterschool-application';

const afterschoolSchema = createSchema({
  name: Type.string({ required: true }),
  description: Type.string({ required: true }),
  grade: Type.array().of(Type.number({ required: true, enum: GradeValues })),
  class: Type.array().of(Type.number({ required: true, enum: ClassValues })),
  key: Type.string(),
  teacher: Type.ref(Type.objectId()).to('User', userSchema),
  day: Type.array().of(Type.string({ required: true, enum: DayValues })),
  time: Type.array().of(Type.string({ required: true, enum: AfterschoolTimeValues })),
  capacity: Type.number({ required: true }),
}, { versionKey: false, timestamps: true });

type AfterschoolDoc = ExtractDoc<typeof afterschoolSchema>;

const AfterschoolModel = typedModel('Afterschool', afterschoolSchema, undefined, undefined, {
  async checkOverlap(applierId: ObjectId, targetId: ObjectId): Promise<Boolean> {
    const target = await AfterschoolModel.findById(targetId);
    // const application = await AfterschoolApplicationModel
    //   .findOne({
    //     applier: applierId,
    //     'afterschool.key': afterschool.key,
    //     'afterschool.day': { $all: afterschool.day },
    //     'afterschool.time': { $all: afterschool.time },
    //   })
    //   .populate('afterschool');
    // 저 위에 거가 자꾸 안 돼서 우선 아래 걸로
    return !!(await AfterschoolApplicationModel
      .find({ applier: applierId })
      .populateTs('afterschool'))
      .filter(({ afterschool }) => (
        afterschool.key === target.key
        || (
          afterschool.day.filter((day) => target.day.includes(day)).length
          && afterschool.time.filter((time) => target.time.includes(time)).length
        )
      ));
  },
});

export {
  afterschoolSchema,
  AfterschoolModel,
};
