import { ObjectId } from 'mongodb';
import { UserModel } from '../models';
import {
  MealExceptionModel,
  MealOrderModel,
  StudentModel,
} from '../models/dalgeurak';

export const reloadDalgeurakStudents = async () => {
  await StudentModel.deleteMany({});
  const users = await UserModel.find({ userType: 'S', serial: { $exists: true } });
  await Promise.all(
    users.map(async (student) => {
      await new StudentModel({
        _id: new ObjectId(student._id),
        idx: student.idx,
        name: student.name,
        grade: student.grade,
        class: student.class,
        number: student.number,
        serial: student.serial,
      }).save();
    }),
  );
};

export const resetStudentMealStatus = async () => {
  await StudentModel.updateMany({}, { status: 'empty' });
};
export const resetMealExceptions = async () => {
  await MealExceptionModel.deleteMany({});
};
export const resetExtraTimes = async () => {
  await MealOrderModel.findOneAndUpdate({ field: 'intervalTime' }, { extraMinute: 0 });
};
