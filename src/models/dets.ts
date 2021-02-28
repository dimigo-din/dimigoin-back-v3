import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import { userSchema } from './user';
import { TimeValues, DayValues, GradeValues } from '../types';
import { placeSchema } from './place';

const detsSchema = createSchema({
  name: Type.string({ required: true, unique: true, trim: true }),
  description: Type.string({ required: true, trim: true }),
  times: Type.array({ required: true, enum: TimeValues }),
  speaker: Type.ref(Type.objectId()).to('User', userSchema),
  days: Type.array({ required: true, enum: DayValues }),
  place: Type.ref(Type.objectId()).to('Place', placeSchema),
  capacity: Type.number({ required: true }),
  targetGrade: Type.number({ required: true, enum: GradeValues }),
  imageUrl: Type.string({ default: null }),
}, { versionKey: false, timestamps: true });

type DetsDoc = ExtractDoc<typeof detsSchema>;

const DetsModel = typedModel('Dets', detsSchema);

export {
  detsSchema,
  DetsModel,
};
