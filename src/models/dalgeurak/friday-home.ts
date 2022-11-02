import { Model, Document } from 'mongoose';
import { createSchema, Type } from 'ts-mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';

interface IFridayHome extends Document {
  userId: number;
  date: string;
}

const friDayHomeState = createSchema({
  userId: Type.number({ required: true }),
  date: Type.string({ required: true }),
}, { versionKey: false, timestamps: true });

const FriDayHomeModel: Model<IFridayHome> = dalgeurakDB.model('fridayhome', friDayHomeState);

export {
  friDayHomeState,
  FriDayHomeModel,
};
