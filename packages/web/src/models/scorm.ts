export interface IScormLearner {
  metadata: Record<string, any>;
  id: string;
  name: string;
  email: string;
  location: string;
  status: string;
  entry: string;
  exit: string;
  suspend_data: string;
}

export type IScormProgress = Pick<
  IScormLearner,
  'metadata' | 'location' | 'status' | 'suspend_data'
>;
