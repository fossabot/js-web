import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalAssessment } from './ExternalAssessment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExternalAssessment])],
  exports: [TypeOrmModule],
})
export class AssessmentEntityModule {}
