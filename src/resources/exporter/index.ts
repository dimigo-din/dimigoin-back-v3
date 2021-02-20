import exceljs from 'exceljs';

export const createStandardBuffer = (eBuffer: exceljs.Buffer) => Buffer.from(eBuffer.toString());

export const setAlignCenter = (sheet: exceljs.Worksheet, cellKey: string) => {
  sheet.getCell(cellKey).alignment = {
    horizontal: 'center',
    vertical: 'middle',
  };
};

export * from './ingang-application';
