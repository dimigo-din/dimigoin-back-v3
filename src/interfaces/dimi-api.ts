/* eslint-disable camelcase */

import { ObjectId } from 'mongodb';
import { Gender, UserType } from '../types';

export interface Account {
  username: string;
  password: string;
}

export interface UserIdentity {
  '_id': ObjectId;
  'id': number;
  'username': string;
  'email': string;
  'name': string;
  'nick': string;
  'gender': Gender;
  'user_type': UserType;
  'birthdate': string;
  'phone': string;
  'photofile1': string;
  'photofile2': string;
}

export interface StudentIdentity {
  'user_id': number;
  'username': string;
  'email': string;
  'name': string;
  'grade': number;
  'class': number;
  'number': number;
  'serial': number;
  'nick': string;
  'gender': Gender;
  'user_type': UserType;
  'birthdate': string;
  'phone': string;
  'photofile1': string;
  'photofile2': string;
}

export interface TeacherIdentity {
  'user_id': number;
  'username': string;
  'name': string;
  'gender': string;
  'position_name': string;
  'role_name': string;
  'grade': number;
  'class': number;
  'phone': string;
}
