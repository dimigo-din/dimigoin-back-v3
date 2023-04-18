import { createSchema, Type, typedModel } from 'ts-mongoose';
import { GenderValues, GradeValues, WasherValues } from '../types';

const washerSchema = createSchema({
  name: Type.string({ required: true, enum: WasherValues }),
  grade: Type.array({ required: true }).of(Type.number({ enum: GradeValues })),
  gender: Type.string({ required: true, enum: GenderValues }),
  timetable: Type.array({ required: true }).of({
    userIdx: Type.number({ required: false }),
    name: Type.string({ required: false }),
    grade: Type.number({ required: false }),
    class: Type.number({ required: false }),
  }),
}, { versionKey: false, timestamps: true });

const WasherModel = typedModel('Washer', washerSchema);
export {
  washerSchema,
  WasherModel,
};
