import { ObjectId } from 'mongodb';
import { Gender, UserType, Grade, Class } from '../types';

export interface User {
  _id: ObjectId;
  name: string;
  gender: Gender;
  phone: string;
  type: UserType;
  grade: Grade;
  class: Class;
  number: number;
  serial: number;
  photo: Array<string>;
}
