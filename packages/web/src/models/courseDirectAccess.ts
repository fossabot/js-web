import { Language } from './language';

export enum CourseDirectAccessorType {
  User = 'user',
  Group = 'group',
  Organization = 'organization',
}

export interface ICourseDirectAccess<T extends Language | string = string> {
  id: string;
  createdAt: string;
  accessorId: string;
  accessorType: CourseDirectAccessorType;
  expiryDateTime: string;
  course: {
    id: string;
    title: T;
  };
  accessor: {
    id: string;
    displayName: string;
  };
}
