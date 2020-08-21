import AuthController from './Auth';
import CircleController from './Circle';
import CircleApplicationController from './CircleApplication';
import CircleApplicationManagementController from './CircleApplicationManagement';
import CircleApplierSelection from './CircleApplierSelection';
import CircleManagementController from './CircleManagement';
import ConfigController from './Config';
import UserController from './User';
import IngangApplicationController from './IngangApplication';

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
];

export default controllers;
