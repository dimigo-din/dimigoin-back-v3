import { ObjectId } from 'mongodb';
import { UserType, Gender } from '../types';

export default interface User {
  _id: ObjectId;
  idx: number;
  username: string;
  name: string;
  userType: UserType;
  gender: Gender;
  phone: string;
  permissions: string[];
  photos: string[];

  position?: string;
  role?: string;

  grade?: number;
  class?: number;
  number?: number;
  serial?: number;
}
