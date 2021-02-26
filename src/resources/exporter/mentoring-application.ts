import exceljs from 'exceljs';
import { MentoringApplicationModel } from '../../models';
import { getWeekStartString, getWeekEndString } from '../date';

interface Time {
  hour: number;
  minute: number;
}

interface Duration {
  start: Time;
  end: Time;
}

const toDurationString = ({ start, end }: Duration) => `${start.hour}:${start.minute} ~ ${end.hour}:${end.minute}`;

export const createMentoringApplierBook = async () => {
  const book = new exceljs.Workbook();
  const sheet = book.addWorksheet('신청자 명단');

  sheet.columns = [
    { header: '신청 일자', key: 'date', width: 14 },
    { header: '신청자', key: 'applier', width: 14 },
    { header: '신청 과목', key: 'subject', width: 18 },
    { header: '진행 시간', key: 'duration', width: 18 },
    { header: '비고', key: 'remark', width: 15 },
  ] as exceljs.Column[];

  const applications = (await MentoringApplicationModel.find({
    date: {
      $gte: getWeekStartString(),
      $lte: getWeekEndString(),
    },
  })
    .populateTs('mentoring')
    .populateTs('applier')
  );

  applications.forEach((application) => {
    sheet.addRow({
      date: application.date,
      applier: `${application.applier.serial} ${application.applier.name}`,
      subject: application.mentoring.name,
      duration: toDurationString(application.mentoring.duration),
    });
  });
  return await book.xlsx.writeBuffer();
};
