export interface LearningWay {
  id: string;
  name: string;
  key?: string;
  parent?: LearningWay;
  children?: LearningWay[];
  isActive: boolean;
}

export enum LearningWayKey {
  FRONTLINE = 'frontLine',
  BEELINE = 'beeLine',
  ONLINE = 'onLine',
  INLINE = 'inLine',
}
