import RootController from './root';
import CircleController from './circle';
import CircleApplicationController from './circle-application';
import CircleApplicationManagementController from './circle-application-management';
import CircleApplierSelection from './circle-application-selection';
import CircleManagementController from './circle-management';
import ConfigController from './config';
import IngangApplicationController from './ingang-application';
import OutgoRequestController from './outgo-request';
import AttendanceLogController from './attendance-log';
import PlaceController from './place';
import NoticeController from './notice';
import OutgoManagementController from './outgo-management';
import AfterschoolController from './afterschool';
import AfterschoolApplicationController from './afterschool-application';

const controllers = [
  new RootController(),
  new CircleController(),
  new CircleApplicationManagementController(),
  new CircleApplicationController(),
  new CircleManagementController(),
  new CircleApplierSelection(),
  new ConfigController(),
  new IngangApplicationController(),
  new AttendanceLogController(),
  new PlaceController(),
  new NoticeController(),
  new OutgoRequestController(),
  new OutgoManagementController(),
  new AfterschoolController(),
  new AfterschoolApplicationController(),
];

export default controllers;
