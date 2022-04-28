/* eslint-disable dot-notation, no-unused-vars, no-console, @typescript-eslint/no-explicit-any */

import { readFile, utils } from 'xlsx';
import path from 'path';

export interface IProvinceData {
  id: number;
  province_code: string;
  province_name: string;
  province_name_en: string;
}
export interface IDistrictData {
  id: number;
  district_code: string;
  district_name: string;
  province_id: number;
  district_name_en: string;
}
export interface ISubdistrictData {
  id: number;
  subdistrict_code: string;
  subdistrict_name: string;
  zip_code: string;
  province_id: number;
  district_id: number;
  subdistrict_name_en: string;
}

function loadExcelDataAsJson<T extends { [index: string]: any }>(
  file: string,
): T[] {
  const wb = readFile(path.join(__dirname, file)); // read workbook
  const data: any[] = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
    header: 1,
  });
  const keys = data[0].map((x: string) => x.toLowerCase()); // header field
  const values = data.slice(1);
  const output = values.map((d: any[]): T => {
    const result = {} as any;
    d.forEach((v: string, i: any) => {
      result[keys[i]] = v;
    });
    return result as T;
  });
  return output;
}

export const getProvinceData = () =>
  loadExcelDataAsJson<IProvinceData>('../../assets/thaddrs_province.xlsx');
export const getDistrictData = () =>
  loadExcelDataAsJson<IDistrictData>('../../assets/thaddrs_district.xlsx');
export const getSubdistrictData = () =>
  loadExcelDataAsJson<ISubdistrictData>(
    '../../assets/thaddrs_subdistrict.xlsx',
  );
