export interface CreateMediaPayload {
  upload: {
    method: 'fetch' | 'direct' | 'multipart' | 'external';
    mime_type: string;
    source_url?: string;
    download_url?: string;
    trim_in_point?: string;
    trim_out_point?: string;
  };
  metadata?: {
    title?: string;
    description?: string;
    author?: string;
    permalink?: string;
    category?: string;
    publish_start_date?: string;
    publish_end_date?: string;
    tags?: string[];
    custom_params?: Record<string, string>;
    external_id?: string;
  };
}

export interface CreateMediaResponse {
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

export interface GetMediaResponse {
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
}

export interface ReuploadMediaPayload {
  upload: {
    method: 'fetch' | 'direct' | 'multipart' | 'external';
    mime_type: string;
    source_url?: string;
    download_url?: string;
    trim_in_point?: string;
    trim_out_point?: string;
  };
}

export type ReuploadMediaResponse = CreateMediaResponse;

export interface ListMediaQuery {
  page?: number;
  page_length?: number;
  q?: string;
  sort?: string;
}

export interface ListMediaResponse {
  page: number;
  page_length: number;
  total: number;
  media: {
    id: string;
    created: string;
    last_modified: string;
    type: string;
    relationships: Record<string, any>;
    metadata: {
      title: string;
      description: string;
      author: string;
      permalink: string;
      category: string;
      publish_start_date: string;
      publich_end_date: string;
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
  }[];
}

export interface UpdateMediaPayload {
  metadata?: {
    title?: string;
    description?: string;
    author?: string;
    permalink?: string;
    category?: string;
    publish_start_date?: string;
    publish_end_date?: string;
    tags?: string[];
    custom_params?: Record<string, string>;
  };
}

export interface UpdateMediaResponse {
  id: string;
  created: string;
  last_modified: string;
  type: string;
  relationships: Record<string, any>;
  metadata: {
    title: string;
    description: string;
    author: string;
    permalink: string;
    category: string;
    publish_start_date: string;
    publich_end_date: string;
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
}
