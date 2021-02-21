import { ObjectId } from 'mongodb';
import { PlaceType } from '../types';

export interface PopulatedPlace {
  _id: ObjectId;
  name: string;
  location: string;
  description?: string;
  type: PlaceType;
};
