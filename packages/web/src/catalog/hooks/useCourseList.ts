import { useEffect, useState } from 'react';
import usePagination from '../../hooks/usePagination';
import CourseApi from '../../http/course.api';
import { CourseLanguage, ICourse } from '../../models/course';
import IPaginationParams from '../../models/IPaginationParams';
import { UserAssignedCourseType } from '../../models/userAssignedCourse';
import { getErrorMessages } from '../../utils/error';
import useCourseFilters from './useCourseFilters';

interface IUseCatalogList {
  id: string;
  type: 'topic' | 'learningWay';
  itemsPerPage?: number;
}

export default function useCourseList({
  id,
  type,
  itemsPerPage = 12,
}: IUseCatalogList) {
  const {
    categoryKey,
    subCategoryKey,
    durationStart,
    durationEnd,
    language,
    hasCertificate,
    assigned,
    required,
  } = useCourseFilters();
  const [courses, setCourses] = useState<ICourse<string>[]>([]);
  const [pagination, setPagination] = useState<IPaginationParams>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<string[]>([]);
  const { page, perPage } = usePagination({ defaultPerPage: 12 });
  const pageLimit = perPage || itemsPerPage;

  async function fetchCourses() {
    setLoading(true);
    try {
      const { data: coursesArray, pagination } = await CourseApi.searchCourses({
        id,
        type,
        language: language || CourseLanguage.ALL,
        categoryKey,
        subCategoryKey,
        durationStart,
        durationEnd,
        hasCertificate: hasCertificate === '1' || undefined,
        page,
        perPage: pageLimit,
        assignmentType:
          assigned === '1'
            ? UserAssignedCourseType.Optional
            : required === '1'
            ? UserAssignedCourseType.Required
            : undefined,
      });
      setCourses(coursesArray);
      setPagination(pagination);
    } catch (error) {
      const messages = getErrorMessages(error);
      setErrors(messages);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, [
    id,
    type,
    categoryKey,
    subCategoryKey,
    durationStart,
    durationEnd,
    language,
    hasCertificate,
    page,
    perPage,
    assigned,
    required,
  ]);

  return { loading, errors, courses, pagination, fetchCourses };
}
