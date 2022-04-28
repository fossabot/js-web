import { Language } from './language';

export enum LearningTrackDirectAccessorType {
  User = 'user',
  Group = 'group',
  Organization = 'organization',
}

export interface ILearningTrackDirectAccess<
  T extends Language | string = string,
> {
  id: string;
  createdAt: string;
  accessorId: string;
  accessorType: LearningTrackDirectAccessorType;
  expiryDateTime: string;
  learningTrack: {
    id: string;
    title: T;
  };
  accessor: {
    id: string;
    displayName: string;
  };
}
