import { ObjectId } from 'mongodb';
import { Gender, Grade, Washer } from '../types';

export interface PopulatedWasher {
  _id: ObjectId;
  name: Washer;
  grade: Grade;
  gender: Gender;
  weekDayTimetable: laundryApplyer[];
  weekEndTimetable: laundryApplyer[];
}

export interface laundryApplyer {
  userIdx: number;
  username: string;
  grade: number;
  class: number;
}