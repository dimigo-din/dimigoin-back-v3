import { NightTime } from '../types';
import { User } from './user';

export interface PopulatedIngangApplications {
  applier: User;
  time: NightTime;
  date: string;
}
