import { ObjectId } from 'mongodb';
import {
  AfterschoolTime, Class, Day, Grade, NightTime,
} from '../types';
import { PopulatedPlace } from './place';
import { User } from './user';

export interface PopulateAfterschool {
  _id: ObjectId;
  name: string;
  description: string;
  targetGrades: Grade[];
  targetClasses: Class[];
  key?: string;
  teacher: User;
  days: Day[];
  times: AfterschoolTime | NightTime;
  capacity: number;
  place: PopulatedPlace;
}
