import {
  createSchema, Type, typedModel,
} from 'ts-mongoose';
import { ObjectId } from 'mongodb';
import { userSchema } from './user';
import {
  AfterschoolTimeValues,
  ClassValues,
  DayValues,
  GradeValues,
  NightTimeValues,
} from '../types';
import { AfterschoolApplicationModel } from './afterschool-application';

const afterschoolSchema = createSchema({
  name: Type.string({ required: true }),
  description: Type.string({ required: true }),
  targetGrades: Type.array().of(Type.number({ required: true, enum: GradeValues })),
  targetClasses: Type.array().of(Type.number({ required: true, enum: ClassValues })),
  key: Type.string(),
  teacher: Type.ref(Type.objectId()).to('User', userSchema),
  days: Type.array().of(Type.string({ required: true, enum: DayValues })),
  times: Type.array().of(Type.string({ required: true, enum: [...AfterschoolTimeValues, ...NightTimeValues] })),
  capacity: Type.number({ required: true }),
}, { versionKey: false, timestamps: true });

const AfterschoolModel = typedModel('Afterschool', afterschoolSchema, undefined, undefined, {
  async checkOverlap(applierId: ObjectId, targetId: ObjectId): Promise<Boolean> {
    const target = await AfterschoolModel.findById(targetId);
    const overlapped = (await AfterschoolApplicationModel
      .find({ applier: applierId })
      .populateTs('afterschool'))
      .filter(({ afterschool }) => {
        // 중복 수강 불가한 강좌인지
        if (target.key && target.key === afterschool.key) return true;
        // 겹치는 요일이 존재하는 동시에 타임까지 겹치는지
        return (
          afterschool.days.filter((day) => target.days.includes(day)).length
          && afterschool.times.filter((time) => target.times.includes(time)).length
        );
      });
    return overlapped.length > 0;
  },
});

export {
  afterschoolSchema,
  AfterschoolModel,
};
