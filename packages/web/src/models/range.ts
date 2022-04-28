export interface RangeBase {
  id: string;
  start: number;
  end: number;
  nameEn: string;
  nameTh: string;
  description: string | null;
}

export type CompanySizeRange = RangeBase;

export type AgeRange = RangeBase;
