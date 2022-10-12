import exceljs from 'exceljs';
import {
  AfterschoolTime,
  Day,
  Grade,
  NightTime,
  AfterschoolTimeValues,
  NightTimeValues,
  DayValues,
} from '../../types';
import { AfterschoolApplicationModel, AfterschoolModel } from '../../models';
import { PopulatedAfterschoolApplication, User } from '../../interfaces';
import { getStudentInfo, studentSearch } from '../dimi-api';

const getAppliedClassName = (
  applications: PopulatedAfterschoolApplication[],
  applierId: number,
  day: Day,
  time: AfterschoolTime | NightTime,
): string => {
  const application = applications.find(
    (a) =>
      a.applier.user_id === applierId
      && a.afterschool.days.includes(day)
      && a.afterschool.times.includes(time),
  );
  return application?.afterschool.name || '자습반';
};

const times = [...AfterschoolTimeValues, ...NightTimeValues];
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

const generateRowContent = (applications: any, student: User) => {
  const row: any = {};
  for (const day of DayValues) {
    for (const time of times) {
      row[`${day}|${time}`] = getAppliedClassName(
        applications,
        student.user_id,
        day,
        time,
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

    const students = (
      await studentSearch({
        grade,
        class: klass,
      })
    ).sort((a, b) => {
      if (a.user_id > b.user_id) {
        return 1;
      }
      if (a.user_id < b.user_id) {
        return -1;
      }
      return 0;
    });
    const applications = (
      await AfterschoolApplicationModel.find().populateTs('afterschool')
    ).filter(async (a) => {
      const student = await getStudentInfo(a.applier);
      return student.grade === grade;
    });

    students.forEach((student: User) => {
      sheet.addRow({
        serial: student.serial,
        name: student.name,
        ...generateRowContent(applications, student),
      });
    });
  }
};

const addApplierByAfterschoolSheet = async (
  book: exceljs.Workbook,
  grade: Grade,
) => {
  const sheet = book.addWorksheet('강좌별 신청자 명단');
  const afterschools = await AfterschoolModel.find({
    targetGrades: { $all: [grade] },
  });
  const afterschoolIds = afterschools.map((a) => a._id);
  const applications = await AfterschoolApplicationModel.find({
    afterschool: { $in: afterschoolIds },
  })
    .sort('afterschool')
    .populateTs('afterschool');

  sheet.columns = [
    { header: '강좌명', key: 'className', width: 25 },
    { header: '신청자', key: 'applier', width: 15 },
  ] as exceljs.Column[];

  for (const { afterschool, applier } of applications) {
    const student = await getStudentInfo(applier);
    sheet.addRow({
      className: afterschool.name,
      applier: `${student.serial} ${student.name}`,
    });
  }
};

export const createAfterschoolApplierBook = async (grade: Grade) => {
  const book = new exceljs.Workbook();

  await addApplierByAfterschoolSheet(book, grade);
  await addApplierByClassSheet(book, grade);

  return await book.xlsx.writeBuffer();
};
