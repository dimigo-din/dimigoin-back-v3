import { ObjectId } from 'mongodb';
import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import { userSchema } from './user';

const detsSchema = createSchema({
  title: Type.string({ required: true, unique: true, trim: true }),
  description: Type.string({ required: true }),
  startDate: Type.date({ required: true }),
  endDate: Type.date({ required: true }),
  requestEndDate: Type.date({ required: true }),
  time: Type.array({ required: true }), // add time type validation
  speakerID: Type.ref(Type.objectId()).to('User', userSchema),
  day: Type.array({ required: true }), // add day type validation
  room: Type.string({ required: true }), // add room type validation
  maxcount: Type.number({ required: true }),
  targetGrade: Type.number({ required: true }), // add grade validation
  imageUrl: Type.string({ required: true }),
  count: Type.number({ required: true }),
  user: [Type.string({ required: true })],
}, { versionKey: false, timestamps: true });

type DetsDoc = ExtractDoc<typeof detsSchema>;

const DetsModel = typedModel('Dets', detsSchema, undefined, undefined, {
  findByTitle(title: String): DetsDoc {
    return this.findOne({ title });
  },
  findBySpeaker(speakerID: ObjectId): DetsDoc {
    return this.findOne({ speakerID });
  },
});

export {
  detsSchema,
  DetsModel,
};
