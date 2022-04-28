import { FilterQuery } from 'typeorm';

export default interface IArchivedTopicFilters {
  name: string | null;
  id?: FilterQuery<string> | null;
}
