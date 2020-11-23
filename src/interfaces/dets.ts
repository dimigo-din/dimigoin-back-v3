import { ObjectId } from 'mongodb';
import { TimeValues,DayValues,GradeValues } from '../types';
  export interface IDets {
    '_id': ObjectId;
    'title': string;
    'description': string;
    'startDate': Date;
    'endDate': Date;
    'speakerID': ObjectId;
    'speakerName': string;
    'time': typeof TimeValues;
    'day': typeof DayValues;
    'room': string;
    'maxCount': number;
    'targetGrade': typeof GradeValues;
    'count': number;
    'status': boolean;
}

export interface IDetsInput {
    'title': string;
    'description': string;
    'startDate': Date;
    'endDate': Date;
    'time': typeof TimeValues;
    'speakerID': ObjectId;
    'date': typeof DayValues;
    'room': string;
    'maxCount': number;
    'targetGrade': typeof GradeValues;
}