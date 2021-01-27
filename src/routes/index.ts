import RootController from './root';
import CircleApplicationManagementController from './circle-application-management';
import CircleApplierSelection from './circle-application-selection';

const controllers = [
  new RootController(),
  new CircleApplicationManagementController(),
  new CircleApplierSelection(),
];

export default controllers;
