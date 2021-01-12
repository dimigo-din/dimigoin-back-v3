import RootController from './root';
import AuthController from './auth';
import CircleController from './circle';
import CircleApplicationController from './circle-application';
import CircleApplicationManagementController from './circle-application-management';
import CircleApplierSelection from './circle-application-selection';
import CircleManagementController from './circle-management';
import ConfigController from './config';
import UserController from './user';
import IngangApplicationController from './ingang-application';
import MealController from './meal';
import OutgoRequestController from './outgo-request';
import AttendanceLogController from './attendance-log';
import PlaceController from './place';
import NoticeController from './notice';
import OutgoManagementController from './outgo-management';
import AfterschoolController from './afterschool';
import AfterschoolApplicationController from './afterschool-application';

const controllers = [
  new RootController(),
  new AuthController(),
  new UserController(),
  new CircleController(),
  new CircleApplicationManagementController(),
  new CircleApplicationController(),
  new CircleManagementController(),
  new CircleApplierSelection(),
  new ConfigController(),
  new IngangApplicationController(),
  new MealController(),
  new AttendanceLogController(),
  new PlaceController(),
  new NoticeController(),
  new OutgoRequestController(),
  new OutgoManagementController(),
  new AfterschoolController(),
  new AfterschoolApplicationController(),
];

export default controllers;
