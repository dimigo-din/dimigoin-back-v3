import { ObjectId } from 'mongodb';
import { Gender, Grade, Washer } from '../types';

export interface PopulatedWasher {
  _id: ObjectId;
  name: Washer;
  grade: Grade;
  gender: Gender;
  timetable: laundryApplyer[];
}

export interface laundryApplyer {
  userId: number;
  username: string;
  grade: number;
  class: number;
}
