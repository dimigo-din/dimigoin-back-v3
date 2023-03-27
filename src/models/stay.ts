import {
  createSchema, Type, typedModel,
} from 'ts-mongoose';

const staySchema = createSchema({
  startlines: Type.array().of(Type.date({ required: true })),
  deadlines: Type.array().of(Type.date({ required: true })),
  disabled: Type.boolean({ required: false }),
  deleted: Type.boolean({ required: false }),
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
