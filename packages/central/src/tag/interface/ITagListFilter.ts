import { TagType } from '@seaccentral/core/dist/tag/TagType.enum';

export class ITagListFilter {
  [x: string]: any;

  isActive: boolean;

  type?: TagType;
}
