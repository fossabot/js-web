import cx from 'classnames';
import { stringifyUrl } from 'query-string';
import { NextRouter, useRouter } from 'next/router';

import {
  FaceToFace,
  FaceToFaceGray,
  OnlineLearningVideo,
  OnlineLearningVideoRed,
  Virtual,
  VirtualGray,
} from '../ui-kit/icons';
import useTranslation from '../i18n/useTranslation';
import { LearningWayKey } from '../models/learning-way';
import { searchTypes } from '../ui-kit/headers/useSearchBar';
import { CourseCategoryKey, CourseSubCategoryKey } from '../models/course';

interface IListItemProps {
  children: React.ReactNode;
  onItemClick: () => Promise<void>;
  hoverStyle?: string;
  activeStyle?: string;
  active?: boolean;
}

const fourLinesOfLearning = {
  [LearningWayKey.ONLINE]: {
    active: 'bg-learning-online-100 text-learning-online-200',
    hover: 'hover:bg-learning-online-100 hover:text-learning-online-200',
  },
  [LearningWayKey.INLINE]: {
    active: 'bg-learning-inline-100 text-learning-inline-200',
    hover: 'hover:bg-learning-inline-100 hover:text-learning-inline-200',
  },
  [LearningWayKey.BEELINE]: {
    active: 'bg-learning-beeline-100 text-learning-beeline-200',
    hover: 'hover:bg-learning-beeline-100 hover:text-learning-beeline-200',
  },
  [LearningWayKey.FRONTLINE]: {
    active: 'bg-learning-frontline-100 text-learning-frontline-200',
    hover: 'hover:bg-learning-frontline-100 hover:text-learning-frontline-200',
  },
};

function Headline({ children, isActive, onHeadlineClick }) {
  return (
    <h4
      className={cx(
        'cursor-pointer rounded-lg px-3 py-14px text-caption font-semibold hover:bg-gray-200',
        { 'text-brand-primary': isActive, 'text-gray-650': !isActive },
      )}
      onClick={onHeadlineClick}
    >
      {children}
    </h4>
  );
}

const onItemClick = async (router: NextRouter, query) => {
  const newUrl = stringifyUrl({
    url: router.pathname,
    query: {
      ...router.query,
      ...query,
      page: undefined,
      perPage: undefined,
    },
  });

  await router.push(newUrl, undefined, { scroll: true });
};

function ListItem({
  children,
  onItemClick,
  hoverStyle,
  activeStyle,
  active,
}: IListItemProps) {
  return (
    <li className="text-caption font-semibold">
      <div
        onClick={onItemClick}
        className={cx(
          'block cursor-pointer overflow-hidden rounded-lg border border-transparent p-3',
          hoverStyle ? hoverStyle : 'hover:bg-gray-200',
          active
            ? activeStyle
              ? activeStyle
              : 'border-gray-200 bg-gray-100'
            : '',
        )}
      >
        {children}
      </div>
    </li>
  );
}

export default function SearchSidebar({
  coursesResultCount,
  instructorsResultCount,
  learningTracksResultCount,
  fourLineOfLearningsResultCount,
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { lineOfLearning, courseCategory, type } = router.query;

  const courseCategories = {
    [CourseCategoryKey.ONLINE_LEARNING]: {
      name: t('searchResultPage.onlineCourses'),
      activeIcon: <OnlineLearningVideoRed className="h-6 w-6" />,
      inactiveIcon: <OnlineLearningVideo className="h-6 w-6" />,
      active: 'text-brand-primary',
    },
    [CourseSubCategoryKey.VIRTUAL]: {
      name: t('searchResultPage.virtual'),
      activeIcon: <Virtual className="h-6 w-6" />,
      inactiveIcon: <VirtualGray className="h-6 w-6" />,
      active: 'text-brand-primary',
    },
    [CourseSubCategoryKey.FACE_TO_FACE]: {
      name: t('searchResultPage.faceToFace'),
      activeIcon: <FaceToFace className="h-6 w-6" />,
      inactiveIcon: <FaceToFaceGray className="h-6 w-6" />,
      active: 'text-brand-primary',
    },
  };

  return (
    <div className="hidden w-230px select-none flex-col rounded-lg border border-gray-300 p-3 lg:flex">
      <div className="border-b border-gray-300 pb-3">
        <Headline
          isActive={!courseCategory && type === searchTypes.COURSE}
          onHeadlineClick={() =>
            onItemClick(router, {
              type: searchTypes.COURSE,
              courseCategory: undefined,
              lineOfLearning: undefined,
              durationStart: undefined,
              durationEnd: undefined,
            })
          }
        >
          <div className="flex justify-between">
            <span>{t('searchResultPage.allCourses')}</span>
            <span>
              {coursesResultCount > 999 ? '999+' : coursesResultCount}
            </span>
          </div>
        </Headline>
        <ul className="mt-3 space-y-3">
          {Object.keys(courseCategories).map((cf, index) => (
            <ListItem
              key={index}
              onItemClick={() =>
                onItemClick(router, {
                  type: searchTypes.COURSE,
                  courseCategory: cf,
                  lineOfLearning: undefined,
                })
              }
              activeStyle={courseCategories[cf].active}
              active={courseCategory === cf}
            >
              <div className="flex items-center justify-start text-caption font-semibold">
                {courseCategory === cf
                  ? courseCategories[cf].activeIcon
                  : courseCategories[cf].inactiveIcon}
                <span className="ml-2 break-words capitalize">
                  {courseCategories[cf].name}
                </span>
              </div>
            </ListItem>
          ))}
        </ul>
      </div>

      <div className="border-b border-gray-300 py-3">
        <Headline
          isActive={type === searchTypes.LEARNING_TRACK}
          onHeadlineClick={() =>
            onItemClick(router, {
              type: searchTypes.LEARNING_TRACK,
              courseCategory: undefined,
              lineOfLearning: undefined,
              durationStart: undefined,
              durationEnd: undefined,
            })
          }
        >
          <div className="flex justify-between">
            <span>{t('searchResultPage.allLearningTracks')}</span>
            <span>
              {learningTracksResultCount > 999
                ? '999+'
                : learningTracksResultCount}
            </span>
          </div>
        </Headline>
      </div>

      <div className="border-b border-gray-300 py-3">
        <Headline
          isActive={!lineOfLearning && type === searchTypes.LINE_OF_LEARNING}
          onHeadlineClick={() =>
            onItemClick(router, {
              type: searchTypes.LINE_OF_LEARNING,
              courseCategory: undefined,
              lineOfLearning: undefined,
              durationStart: undefined,
              durationEnd: undefined,
            })
          }
        >
          <div className="flex justify-between">
            <span>{t('searchResultPage.fourLineLearning')}</span>
            <span>
              {fourLineOfLearningsResultCount > 999
                ? '999+'
                : fourLineOfLearningsResultCount}
            </span>
          </div>
        </Headline>
        <ul className="mt-3 space-y-3">
          {Object.keys(fourLinesOfLearning).map((flol, index) => (
            <ListItem
              key={index}
              onItemClick={() =>
                onItemClick(router, {
                  type: searchTypes.LINE_OF_LEARNING,
                  courseCategory: undefined,
                  lineOfLearning: flol,
                })
              }
              hoverStyle={fourLinesOfLearning[flol].hover}
              activeStyle={fourLinesOfLearning[flol].active}
              active={lineOfLearning === flol}
            >
              <span className="break-words pl-3 capitalize">{flol}</span>
            </ListItem>
          ))}
        </ul>
      </div>

      <div className="pt-3">
        <Headline
          isActive={type === searchTypes.INSTRUCTOR}
          onHeadlineClick={() =>
            onItemClick(router, {
              type: searchTypes.INSTRUCTOR,
              courseCategory: undefined,
              lineOfLearning: undefined,
              durationStart: undefined,
              durationEnd: undefined,
            })
          }
        >
          <div className="flex justify-between">
            <span>{t('searchResultPage.instructors')}</span>
            <span>
              {instructorsResultCount > 999 ? '999+' : instructorsResultCount}
            </span>
          </div>
        </Headline>
      </div>
    </div>
  );
}
