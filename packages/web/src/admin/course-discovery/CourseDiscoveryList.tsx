import { useEffect, useState } from 'react';
import API_PATHS from '../../constants/apiPaths';
import { centralHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import {
  CourseDiscoveryType,
  ICourseDiscovery,
  ICourseDiscoveryList,
} from '../../models/course-discovery';
import Button from '../../ui-kit/Button';
import { swapElement } from '../../utils/array';
import { CourseDiscoveryListSection } from './CourseDiscoveryListSection';
import { useCourseDiscovery } from './useCourseDiscovery';
import { uniq } from 'lodash';
import { useToasts } from 'react-toast-notifications';
import { toastMessage } from '../../ui-kit/ToastMessage';
import { Check, Warning } from '../../ui-kit/icons';

export const CourseDiscoveryList = () => {
  const { t } = useTranslation();
  const { addToast } = useToasts();

  const {
    fetchCourseDiscovery,
    highlightedCourses,
    newReleases,
    popularCourses,
    setHighlightedCourses,
    setNewReleases,
    setPopularCourses,
  } = useCourseDiscovery();

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCourseDiscovery();
  }, []);

  const getSetState = (type: CourseDiscoveryType) => {
    return type === CourseDiscoveryType.HIGHLIGHT
      ? setHighlightedCourses
      : type === CourseDiscoveryType.POPULAR
      ? setPopularCourses
      : setNewReleases;
  };

  const onAddCourse =
    (type: CourseDiscoveryType) => (newCourses: ICourseDiscovery[]) => {
      const setState = getSetState(type);

      setState((courses) => [...courses, ...newCourses]);
    };

  const onRemoveCourse = (type: CourseDiscoveryType) => (id: string) => {
    const setState = getSetState(type);
    setState((courses) => courses.filter((course) => course.id !== id));
  };

  const onSwapCourse =
    (type: CourseDiscoveryType) => (currentIndex: number, newIndex: number) => {
      const setState = getSetState(type);

      setState((courses) => swapElement(courses, currentIndex, newIndex));
    };

  const onSave = async () => {
    try {
      setIsSaving(true);
      const res = await centralHttp.post<BaseResponseDto<ICourseDiscoveryList>>(
        API_PATHS.COURSE_DISCOVERY,
        {
          highlights: uniq(highlightedCourses.map((course) => course.id)),
          popular: uniq(popularCourses.map((course) => course.id)),
          newReleases: uniq(newReleases.map((course) => course.id)),
        },
      );
      setHighlightedCourses(res.data.data.highlights);
      setPopularCourses(res.data.data.popular);
      setNewReleases(res.data.data.newReleases);
      addToast(
        toastMessage({
          icon: <Check className="h-5 w-5" />,
          title: t('courseDiscoveryManagementPage.coursesSaved'),
        }),
        { appearance: 'success' },
      );
    } catch (err) {
      addToast(
        toastMessage({
          icon: <Warning className="h-5 w-5" />,
          title: t('courseDiscoveryManagementPage.coursesSavedFailed'),
        }),
        { appearance: 'error' },
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!highlightedCourses || !popularCourses || !newReleases) return null;

  return (
    <div className="flex flex-col items-center space-y-4">
      <CourseDiscoveryListSection
        sectionLabel={t('courseDiscoveryManagementPage.highlightedCourses')}
        emptyLabel={t('courseDiscoveryManagementPage.emptyHighlightedCourses')}
        courses={highlightedCourses}
        onAdd={onAddCourse(CourseDiscoveryType.HIGHLIGHT)}
        onRemove={onRemoveCourse(CourseDiscoveryType.HIGHLIGHT)}
        onSwap={onSwapCourse(CourseDiscoveryType.HIGHLIGHT)}
      />
      <CourseDiscoveryListSection
        sectionLabel={t('courseDiscoveryManagementPage.popularCourses')}
        emptyLabel={t('courseDiscoveryManagementPage.emptyPopularCourses')}
        courses={popularCourses}
        onAdd={onAddCourse(CourseDiscoveryType.POPULAR)}
        onRemove={onRemoveCourse(CourseDiscoveryType.POPULAR)}
        onSwap={onSwapCourse(CourseDiscoveryType.POPULAR)}
      />
      <CourseDiscoveryListSection
        sectionLabel={t('courseDiscoveryManagementPage.newReleases')}
        emptyLabel={t('courseDiscoveryManagementPage.emptyNewReleases')}
        courses={newReleases}
        onAdd={onAddCourse(CourseDiscoveryType.NEW_RELEASE)}
        onRemove={onRemoveCourse(CourseDiscoveryType.NEW_RELEASE)}
        onSwap={onSwapCourse(CourseDiscoveryType.NEW_RELEASE)}
      />

      <div className="flex justify-end lg:w-2/3">
        <Button
          variant="primary"
          type="submit"
          size="medium"
          avoidFullWidth
          onClick={() => {
            onSave();
          }}
          disabled={isSaving}
          isLoading={isSaving}
        >
          {t('courseDiscoveryManagementPage.save')}
        </Button>
      </div>
    </div>
  );
};
