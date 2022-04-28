export interface Topic {
  id: string;
  name: string;
  description: string;
  parent?: Topic;
  children?: Topic[];
  isActive: boolean;
}
