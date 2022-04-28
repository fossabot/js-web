import { ApiResponseProperty } from '@nestjs/swagger';

export class PrepareUploadResponse {
  @ApiResponseProperty()
  key: string;

  @ApiResponseProperty()
  url: string;
}
