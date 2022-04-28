import API_PATHS from '../constants/apiPaths';
import { ERROR_CODES } from '../constants/errors';
import { centralHttp } from '../http';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import {
  CourseCategoryKey,
  CourseSubCategoryKey,
  ICourseDetail,
} from '../models/course';
import { ExternalAssessment } from '../models/externalAssessment';
import {
  CreateAssessmentResponseBody,
  RegenerateAssessmentResponseBody,
} from '../models/IAssessmentCenter';

export function useCourseAssessment(courseDetail: ICourseDetail) {
  async function fetchAssessment(courseOutlineId: string) {
    try {
      const { data } = await centralHttp.get<
        BaseResponseDto<ExternalAssessment>
      >(
        API_PATHS.ASSESSMENT_CENTER.replace(
          ':courseOutlineId',
          courseOutlineId,
        ),
      );
      return data.data;
    } catch (error) {
      if (error.response.data.code === ERROR_CODES.ASSESSMENT_NOT_FOUND.code) {
        return null;
      }
      throw error;
    }
  }

  async function takeAssessment() {
    const endpoint = API_PATHS.ASSESSMENT_CENTER.replace(
      ':courseOutlineId',
      courseDetail.courseOutlines[0].id,
    );
    const externalAssessment = await fetchAssessment(
      courseDetail.courseOutlines[0].id,
    );
    if (!externalAssessment) {
      const { data } = await centralHttp.post<
        BaseResponseDto<CreateAssessmentResponseBody>
      >(endpoint);
      window.open(data.data.assessment_link, '_blank');
      return;
    }
    if (
      courseDetail.courseOutlines[0].assessmentUserCanRetest &&
      courseDetail.userEnrolledCourse[0].percentage >= 100
    ) {
      const { data } = await centralHttp.put<
        BaseResponseDto<RegenerateAssessmentResponseBody>
      >(endpoint);
      window.open(data.data.assessment_link, '_blank');
      return;
    }
    window.open(externalAssessment.assessmentUrl, '_blank');
  }

  function isRetestable() {
    return courseDetail.courseOutlines[0]?.assessmentUserCanRetest;
  }

  function isAssessmentCourse() {
    return (
      courseDetail.category.key === CourseCategoryKey.ASSESSMENT &&
      courseDetail.courseOutlines[0]?.category.key ===
        CourseSubCategoryKey.ASSESSMENT
    );
  }

  return {
    fetchAssessment,
    takeAssessment,
    isRetestable,
    isAssessmentCourse,
  };
}
