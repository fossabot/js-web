export enum CertificationOrientation {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export enum CertificationType {
  COURSE = 'course',
  LEARNING_TRACK = 'learningTrack',
}

export interface ICertificate {
  id: string;
  orientation: CertificationOrientation;
  certType: CertificationType | null;
  title: string;
  filename: string;
  hash: string;
  bytes: number;
  mime: string;
  key: string;
  uploader: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  provider: string;

  isActive: boolean;
  createdAt: string;
}

export type UserCertificate = Pick<
  ICertificate,
  'provider' | 'title' | 'orientation'
> & {
  id: string;
  certificateId: ICertificate['id'];
  completedDate: Date;
  courseId?: string;
  courseTopic?: any;
};
