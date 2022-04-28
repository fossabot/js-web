import { Base } from './base';
import { User } from './user';

export enum MaterialType {
  MATERIAL_INTERNAL = 'MaterialInternal',
  MATERIAL_EXTERNAL = 'MaterialExternal',
}

export interface BaseMaterial extends Base {
  readonly type: MaterialType;

  displayName: string;

  language: string;

  uploader: User;
}

export interface MaterialInternal extends BaseMaterial {
  mime: string;

  filename: string;

  key: string;

  bytes: number;

  hash: string;
}

export interface MaterialExternal extends BaseMaterial {
  url: string;
}
