import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { InstructorResponseDto } from './dto/InstructorResponse.dto';
import { InstructorService } from './instructor.service';

@Controller('v1/instructors')
@ApiTags('Instructor')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  @UseInterceptors(ClassSerializerInterceptor)
  async getAll() {
    const instructors = await this.instructorService.getAll();
    const response = new BaseResponseDto<InstructorResponseDto[]>();
    response.data = instructors.map(
      (instructor) => new InstructorResponseDto(instructor),
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getInstructor(@Param('id') id: string) {
    const instructor = await this.instructorService.getInstructor(id);

    const response = new BaseResponseDto<InstructorResponseDto>();

    response.data = new InstructorResponseDto(instructor);

    return response;
  }
}
