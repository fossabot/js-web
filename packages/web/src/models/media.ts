import { Base } from './base';
import { User } from './user';

export enum MediaStatus {
  Created = 'CREATED',
  Available = 'AVAILABLE',
}

export interface Media extends Base {
  status: MediaStatus;

  jwMediaId: string;

  uploader: User;

  title: string;

  description: string | null;

  duration: number;

  filename: string;

  bytes: number;

  mime: string;
}

export interface MediaExtended extends Media {
  playlistId: string;
  courseOutlineId: string;
  spentDuration: number;
  percentage: number;
}

export interface VideoProgress {
  id: string;
  spentDuration: number;
  totalDuration: number;
  percentage: number;
}
