import { ObjectId } from 'mongodb';
import { TimeValues, DayValues, GradeValues } from '../types';

export interface IDets {
    '_id': ObjectId;
    'title': string;
    'description': string;
    'startDate': Date;
    'endDate': Date;
    'requestEndDate': Date;
    'speakerID': ObjectId;
    'speakerName': string;
    'time': typeof TimeValues;
    'day': typeof DayValues;
    'room': string;
    'maxCount': number;
    'imageUrl': string;
    'targetGrade': typeof GradeValues;
    'count': number;
}

export interface IDetsInput {
    'title': string;
    'description': string;
    'startDate': Date;
    'endDate': Date;
    'requestEndDate': Date;
    'time': typeof TimeValues;
    'speakerID': ObjectId;
    'day': typeof DayValues;
    'room': string;
    'maxCount': number;
    'targetGrade': typeof GradeValues;
    'imageUrl': string;
}
