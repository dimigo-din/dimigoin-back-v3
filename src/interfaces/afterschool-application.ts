import { ObjectId } from "mongodb";
import { PopulateAfterschool } from "./afterschool";
import { User } from "./user";

export interface PopulatedAfterschoolApplication {
  _id: ObjectId;
  applier: User;
  afterschool: PopulateAfterschool;
};
