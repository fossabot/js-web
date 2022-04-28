import { TagType } from '@seaccentral/core/dist/tag/TagType.enum';
import { FilterQuery } from 'typeorm';

export interface IArchivedTagFilters {
  name: string;
  id?: FilterQuery<string> | null;
  type?: TagType | null;
}
