import {
  createSchema, Type, typedModel,
} from 'ts-mongoose';

const staySchema = createSchema({
  startline: Type.date({ required: true }),
  deadline: Type.date({ required: true }),
  disabled: Type.boolean({ required: true }),
  deleted: Type.boolean({ required: true }),
  dates: Type.array().of({
    date: Type.date({ required: true }),
    outgo: Type.boolean({ required: true }),
  }),
}, { versionKey: false, timestamps: true });

const StayModel = typedModel('Stay', staySchema);

export {
  staySchema,
  StayModel,
};
