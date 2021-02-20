import exceljs from 'exceljs';
import { setAlignCenter } from './index';
import { Grade } from '../../types';
import { getKoreanTodayFullString } from '../date';

export const createIngangApplierBook = async (grade: Grade, applications: [any[], any[]]) => {
  const book = new exceljs.Workbook();
  const sheet = book.addWorksheet('신청자 명단');
  const createdAt = getKoreanTodayFullString();

  sheet.columns = (
    ['A', 'B', 'C', 'D', 'E', 'F']
      .map((key) => ({ key, width: 13 }))
  ) as exceljs.Column[];

  const titleCellKey = 'A1:F2';
  sheet.mergeCells(titleCellKey);
  sheet.getCell(titleCellKey).value = `${grade}학년 인터넷 강의실 좌석 신청 현황 (${createdAt} 기준)`;
  sheet.getRows(1, 2).forEach((r) => { r.height = 10; });
  setAlignCenter(sheet, titleCellKey);

  const signatureSpace = ' '.repeat(15);
  const signatureCellKeys = ['A3:C3', 'D3:F3'];
  signatureCellKeys.forEach((cellKey, index) => {
    sheet.mergeCells(cellKey);
    sheet.getCell(cellKey).value = `${index + 1}타임 도우미 서명  (${signatureSpace})`;
    setAlignCenter(sheet, cellKey);
  });

  const applicantHeaders = ['A4:C4', 'D4:F4'];
  applicantHeaders.forEach((cellKey, index) => {
    sheet.mergeCells(cellKey);
    sheet.getCell(cellKey).value = `${index + 1}타임 신청자 명단`;
    setAlignCenter(sheet, cellKey);
  });

  sheet.getCell('A5').value = '학번';
  sheet.getCell('B5').value = '학번';
  sheet.getCell('C5').value = '비고';
  sheet.getCell('D5').value = '이름';
  sheet.getCell('E5').value = '비고';
  sheet.getCell('F5').value = '비고';
  setAlignCenter(sheet, 'A5:F5');

  const ack = [
    ['A', 'B', 'C'], ['D', 'E', 'F'],
  ];
  for (let time = 0; time < 2; time += 1) {
    const { length } = applications[time];
    for (let i = 0; i < length; i += 1) {
      sheet.getCell(`${ack[time][0]}${i + 6}`).value = applications[time][i].applier.serial;
      sheet.getCell(`${ack[time][1]}${i + 6}`).value = applications[time][i].applier.name;
      sheet.getCell(`${ack[time][2]}${i + 6}`).value = '';
    }
  }
  const maxLength = Math.max(...applications.map((a) => a.length));
  setAlignCenter(sheet, `A6:F${maxLength + 6}`);

  return await book.xlsx.writeBuffer();
};
