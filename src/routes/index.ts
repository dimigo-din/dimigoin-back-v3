import RootController from './root';
import CircleApplicationController from './circle-application';
import CircleApplicationManagementController from './circle-application-management';
import CircleApplierSelection from './circle-application-selection';
import AttendanceLogController from './attendance-log';
import AfterschoolApplicationController from './afterschool-application';

const controllers = [
  new RootController(),
  new CircleApplicationManagementController(),
  new CircleApplicationController(),
  new CircleApplierSelection(),
  new AttendanceLogController(),
  new AfterschoolApplicationController(),
];

export default controllers;
