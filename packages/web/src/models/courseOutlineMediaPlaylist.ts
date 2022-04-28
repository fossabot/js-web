import { Media } from './media';

export interface CourseOutlineMediaPlaylist {
  courseOutlineId: string;

  mediaId: string;

  sequence: number;

  courseOutline: any;

  media: Media;
}
