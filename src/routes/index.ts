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
import OutgoController from './outgo-request';

const controllers = [
  new AuthController(),
  new UserController(),
  new CircleController(),
  new CircleManagementController(),
  new CircleApplicationController(),
  new CircleApplicationManagementController(),
  new CircleApplierSelection(),
  new ConfigController(),
  new IngangApplicationController(),
  new MealController(),
  new OutgoController(),
];

export default controllers;
