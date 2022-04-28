import { ICourse } from './course';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ICourseDiscovery extends ICourse<string> {}

export interface ICourseDiscoveryList {
  highlights: ICourseDiscovery[];
  popular: ICourseDiscovery[];
  newReleases: ICourseDiscovery[];
}

export enum CourseDiscoveryType {
  'HIGHLIGHT' = 'highlight',
  'POPULAR' = 'popular',
  'NEW_RELEASE' = 'newRelease',
}
