import RootController from './root';
import CircleApplicationController from './circle-application';
import CircleApplicationManagementController from './circle-application-management';
import CircleApplierSelection from './circle-application-selection';
import CircleManagementController from './circle-management';
import IngangApplicationController from './ingang-application';
import AttendanceLogController from './attendance-log';
import AfterschoolController from './afterschool';
import AfterschoolApplicationController from './afterschool-application';

const controllers = [
  new RootController(),
  new CircleApplicationManagementController(),
  new CircleApplicationController(),
  new CircleManagementController(),
  new CircleApplierSelection(),
  new IngangApplicationController(),
  new AttendanceLogController(),
  new AfterschoolController(),
  new AfterschoolApplicationController(),
];

export default controllers;
