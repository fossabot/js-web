import { Controller, Get, Req, Response, UseGuards } from '@nestjs/common';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import IRequestWithUser from '@seaccentral/core/dist/user/IRequestWithUser';
import { Response as ExpressResponse } from 'express';
import { CourseActivitiesRecordService } from './courseActivitiesRecord.service';

@Controller('v1/course-activities')
export class CourseActivitiesController {
  constructor(
    private readonly courseActivitiesRecordService: CourseActivitiesRecordService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('records/me')
  async exportMyRecord(
    @Req() req: IRequestWithUser,
    @Response() res: ExpressResponse,
  ) {
    const csvstream = await this.courseActivitiesRecordService.csvReport(
      req.user,
    );
    csvstream.on('error', (error) =>
      res.status(500).json({ error: error.message }),
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=course-reports.csv',
    );
    return csvstream.pipe(res);
  }
}
