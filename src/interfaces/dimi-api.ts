/* eslint-disable camelcase */

import { ObjectId } from 'mongodb';
import { Gender, UserType } from '../types';

export interface IAccount {
  username: string;
  password: string;
}

export interface IUserIdentity {
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

export interface IStudentIdentity {
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
