import XLSX from 'xlsx';

import { DATE_TIME_FORMAT_A } from '../constants/datetime';

export const convertExcelToSheet = (excel: File): XLSX.WorkSheet => {
  return new Promise((resolve, reject): any => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(excel);
    reader.onload = (e) => {
      const buffer = e.target.result;
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      resolve(sheet);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

export const convertExcelToJson = async <T = any>(
  excel: File,
  opts?: XLSX.Sheet2JSONOpts,
): Promise<T[]> => {
  const sheet = await convertExcelToSheet(excel);
  return XLSX.utils.sheet_to_json<T>(sheet, opts);
};

export const convertJSONToSheet = (data: any[], opts: XLSX.JSON2SheetOpts) => {
  return XLSX.utils.json_to_sheet(data, opts);
};

export const createWorkBook = () => XLSX.utils.book_new();

export const appendWorkSheetToWorkBook = (
  wb: XLSX.WorkBook,
  ws: XLSX.WorkSheet,
  sheetName: string,
) => XLSX.utils.book_append_sheet(wb, ws, sheetName);

export const downloadWorkBook = (wb: XLSX.WorkBook, fileName: string) =>
  XLSX.writeFile(wb, fileName);

export const parseDate = (dateNumber: number) =>
  XLSX.SSF.parse_date_code(dateNumber);

export function formatDate(date: XLSX.SSF.SSF$Date, format: string) {
  switch (format) {
    case DATE_TIME_FORMAT_A:
      return `${date.m}/${date.d}/${date.y} ${date.H}:${date.M}`;
    default:
      return `${date.m}/${date.d}/${date.y}`;
  }
}

export function autofitColumns(json: any[], worksheet: XLSX.WorkSheet) {
  const objectMaxLength = [];

  json.map((jsonData) => {
    Object.entries(jsonData).map(([, v], idx) => {
      const columnValue = v as string;
      objectMaxLength[idx] =
        objectMaxLength[idx] >= columnValue.length
          ? objectMaxLength[idx]
          : columnValue.length;
    });
  });

  const wscols = objectMaxLength.map((w: number) => ({
    width: w < 20 ? 20 : w,
  }));
  worksheet['!cols'] = wscols;
}
