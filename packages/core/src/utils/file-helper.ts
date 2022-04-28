import XLSX from 'xlsx';
import * as AWS from 'aws-sdk';

export const convertExcelBufferToJson = async (buffer: AWS.S3.Body) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
};
