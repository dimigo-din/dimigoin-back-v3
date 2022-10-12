import { ObjectId } from 'mongodb';
import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';

const circleSchema = createSchema({
  name: Type.string({ required: true, unique: true, trim: true }),
  fullName: Type.string({ required: false }),
  imageUrl: Type.string({ required: true }),
  notion: Type.string({ required: true }),
  chair: Type.number({ required: true }),
  viceChair: Type.number({ required: true }),
  category: Type.string({
    required: true,
  }),
}, { versionKey: false, timestamps: true });

type CircleDoc = ExtractDoc<typeof circleSchema>;

const CircleModel = typedModel('Circle', circleSchema, undefined, undefined, {
  findByChair(chair: ObjectId): CircleDoc {
    return this.findOne({ chair });
  },
  findByViceChair(viceChair: ObjectId): CircleDoc {
    return this.findOne({ viceChair });
  },
  findByChairs(user: number): CircleDoc {
    return this.findOne({ $or: [{ chair: user }, { viceChair: user }] });
  },
});

export {
  circleSchema,
  CircleModel,
};
