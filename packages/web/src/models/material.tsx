import { MaterialType } from './baseMaterial';

export interface IMaterial {
  displayName: string;
  filename: string;
  hash: string;
  key: string;
  language: string;
  mime: string;
  type: MaterialType;
  url: string;
}
