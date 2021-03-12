import exceljs from 'exceljs';
import { ObjectId } from 'mongodb';
import {
  AfterschoolTime, Day, Grade, NightTime,
  AfterschoolTimeValues, NightTimeValues, DayValues,
} from '../../types';
import {
  AfterschoolApplicationModel, UserModel, UserDoc, AfterschoolModel,
} from '../../models';
import { PopulatedAfterschoolApplication } from '../../interfaces';

const getAppliedClassName = (
  applications: PopulatedAfterschoolApplication[],
  applierId: ObjectId,
  day: Day,
  time: AfterschoolTime | NightTime,
): string => {
  const application = applications.find((a) => a.applier._id.equals(applierId)
      && a.afterschool.days.includes(day)
      && a.afterschool.times.includes(time));
  return application?.afterschool.name || '신청 안 함';
};

const times = [
  ...AfterschoolTimeValues,
  ...NightTimeValues,
];
const timeStrings = {
  AFSC1: '방과후 1T',
  AFSC2: '방과후 2T',
  NSS1: '야자 1T',
  NSS2: '야자 2T',
};
const dayStrings = {
  sun: '일',
  mon: '월',
  tue: '화',
  wed: '수',
  thr: '목',
  fri: '금',
  sat: '토',
};

const generateColumnSchema = () => {
  const columns = [];
  for (const day of DayValues) {
    for (const time of times) {
      columns.push({
        header: `(${dayStrings[day]}) ${timeStrings[time]}`,
        key: `${day}|${time}`,
        width: 20,
      });
    }
  }
  return columns;
};

const generateRowContent = (applications: any, student: UserDoc) => {
  const row: any = {};
  for (const day of DayValues) {
    for (const time of times) {
      row[`${day}|${time}`] = getAppliedClassName(
        applications, student._id, day, time,
      );
    }
  }
  return row;
};

const addApplierByClassSheet = async (book: exceljs.Workbook, grade: Grade) => {
  for (let klass = 1; klass <= 6; klass += 1) {
    const sheet = book.addWorksheet(`${klass}반 신청자 명단`);

    sheet.columns = [
      { header: '학번', key: 'serial', width: 6 },
      { header: '이름', key: 'name', width: 10 },
      ...generateColumnSchema(),
      { header: '비고', key: 'remark', width: 15 },
    ] as exceljs.Column[];

    const students = await UserModel.find({ grade, class: klass }).sort('serial');
    const applications = (await AfterschoolApplicationModel.find()
      .populateTs('applier')
      .populateTs('afterschool'))
      .filter((a) => a.applier.grade === grade);

    students.forEach((student) => {
      sheet.addRow({
        serial: student.serial,
        name: student.name,
        ...generateRowContent(
          applications,
          student,
        ),
      });
    });
  }
};

const addApplierByAfterschoolSheet = async (book: exceljs.Workbook, grade: Grade) => {
  const sheet = book.addWorksheet('강좌별 신청자 명단');
  const afterschools = await AfterschoolModel.find(
    { targetGrades: { $all: [grade] } },
  );
  const afterschoolIds = afterschools.map((a) => a._id);
  const applications = await AfterschoolApplicationModel.find(
    { afterschool: { $in: afterschoolIds } },
  )
    .sort('afterschool')
    .populateTs('afterschool')
    .populateTs('applier');

  sheet.columns = [
    { header: '강좌명', key: 'className', width: 20 },
    { header: '신청자 학번', key: 'applierSerial', width: 13 },
    { header: '신청자 이름', key: 'applierName', width: 13 },
  ] as exceljs.Column[];

  for (const application of applications) {
    sheet.addRow({
      className: application.afterschool.name,
      applierSerial: application.applier.serial,
      applierName: application.applier.name,
    });
  }
};

export const createAfterschoolApplierBook = async (grade: Grade) => {
  const book = new exceljs.Workbook();

  await addApplierByAfterschoolSheet(book, grade);
  await addApplierByClassSheet(book, grade);

  return await book.xlsx.writeBuffer();
};
