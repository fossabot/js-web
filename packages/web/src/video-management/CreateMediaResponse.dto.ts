import { Media } from '../models/media';

export interface CreateMediaResponse {
  media: Media;
  jwMedia: JWCreateMediaResponse;
}

export interface JWCreateMediaResponse {
  id: string;
  created: string;
  last_modified: string;
  type: string;
  relationships: Record<string, any>;
  metadata: {
    title: string;
    description: string | null;
    author: string | null;
    permalink: string | null;
    category: string | null;
    publish_start_date: string;
    publish_end_date: string | null;
    tags: string[];
    custom_params: Record<string, string>;
  };
  status: string;
  media_type: string;
  hosting_type: string;
  mime_type: string;
  error_message: string | null;
  duration: number;
  trim_in_point: string | null;
  trim_out_point: string | null;
  upload_link: string;
}
