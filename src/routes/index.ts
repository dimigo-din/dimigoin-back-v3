import RootController from './root';
import CircleApplicationManagementController from './circle-application-management';
import CircleApplierSelection from './circle-application-selection';
import AfterschoolApplicationController from './afterschool-application';

const controllers = [
  new RootController(),
  new CircleApplicationManagementController(),
  new CircleApplierSelection(),
  new AfterschoolApplicationController(),
];

export default controllers;
