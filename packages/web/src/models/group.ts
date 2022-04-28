export interface IGroup {
  id: string;
  name: string;
  parentId: string | null;
  showOnlySubscribedCourses: boolean;
  disableUpgrade: boolean;
  children?: IGroup[];
}
