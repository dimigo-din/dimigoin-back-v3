import { ObjectId } from 'mongodb';
import { UserType, Gender } from '../types';

export default interface IUser {
  _id: ObjectId;
  idx: number;
  username: string;
  name: string;
  userType: UserType;
  gender: Gender;
  phone: string;

  grade?: number;
  class?: number;
  number?: number;
  serial?: number;

  photo: string[];
}
