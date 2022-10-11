import { ObjectId } from 'mongodb';
import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import { CircleApplicationStatusValues } from '../types';
import { circleSchema } from './circle';

const circleApplicationQuestionSchema = createSchema({
  question: Type.string({ required: true, trim: true, unique: true }),
  maxLength: Type.number({ required: true }),
}, { versionKey: false, timestamps: true });

const circleApplicationSchema = createSchema({
  applier: Type.number({ required: true }),
  form: Type.mixed({ required: true }),
  circle: Type.ref(Type.objectId()).to('Circle', circleSchema),
  status: Type.string({
    required: true,
    default: 'applied',
    enum: CircleApplicationStatusValues,
  }),
}, { versionKey: false, timestamps: true });

type CircleApplicationDoc = ExtractDoc<typeof circleApplicationSchema>;

const CircleApplicationQuestionModel = typedModel('CircleApplicationQuestion', circleApplicationQuestionSchema);
const CircleApplicationModel = typedModel('CircleApplication', circleApplicationSchema, undefined, undefined, {
  findByApplier(applier: number): CircleApplicationDoc[] {
    return this.find({ applier });
  },
  findByCircle(circle: ObjectId): CircleApplicationDoc[] {
    return this.find({ circle });
  },
  findByCircleApplier(circle: ObjectId, applier: ObjectId): CircleApplicationDoc {
    return this.findOne({ circle, applier });
  },
});

export {
  circleApplicationQuestionSchema,
  circleApplicationSchema,
  CircleApplicationQuestionModel,
  CircleApplicationModel,
};
