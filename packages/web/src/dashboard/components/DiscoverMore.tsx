import { format } from 'date-fns';
import { Dispatch, FC, MouseEventHandler } from 'react';
import CourseItem from '../../catalog/components/CourseItem';
import { useResponsive } from '../../hooks/useResponsive';
import useTranslation from '../../i18n/useTranslation';
import {
  CourseDiscoveryType,
  ICourseDiscovery,
} from '../../models/course-discovery';
import { ChevronDown, ChevronUp } from '../../ui-kit/icons';
import { Tabs, ITabsProps } from '../../ui-kit/tabs/Tabs';

const MAX_DISCOVERY_COURSES = 8;

export interface IDiscoverMore {
  activeTab: CourseDiscoveryType;
  onChangeTab: Dispatch<CourseDiscoveryType>;
  tabs: ITabsProps['items'];
  discoveryCourses: ICourseDiscovery[];
  showMore: boolean;
  onShowMore: MouseEventHandler<HTMLAnchorElement>;
}

export const DiscoverMore: FC<IDiscoverMore> = (props) => {
  const { t } = useTranslation();
  const { lg } = useResponsive();
  const {
    activeTab,
    onChangeTab,
    tabs,
    discoveryCourses,
    showMore,
    onShowMore,
  } = props;

  return (
    <>
      <div className="mt-8 lg:mt-12">
        <div className="mt-6 flex flex-col justify-between lg:mt-15 lg:flex-row">
          <div className="mx-6 mb-6 flex items-center space-x-4 lg:mx-0 lg:mb-0">
            <h5 className="text-subtitle font-semibold text-gray-900">
              {t('dashboardHomePage.discoverMore')}
            </h5>
            <span className="text-gray-500">
              {format(new Date(), 'MMMM yyyy')}
            </span>
          </div>

          <Tabs
            rounded={lg}
            className="w-full lg:w-auto"
            active={activeTab}
            onClick={(tab) => onChangeTab(tab as CourseDiscoveryType)}
            items={tabs}
          />
        </div>
      </div>
      <div className="mt-6 mb-12 grid grid-cols-1 justify-center gap-y-6 lg:mt-12 lg:grid-cols-4 lg:gap-x-8">
        {discoveryCourses
          ?.slice(
            0,
            lg
              ? MAX_DISCOVERY_COURSES
              : showMore
              ? MAX_DISCOVERY_COURSES
              : MAX_DISCOVERY_COURSES / 2,
          )
          .map((course) => {
            return (
              <div key={course.id} className="flex justify-center">
                <CourseItem course={course} />
              </div>
            );
          })}
        {(discoveryCourses?.length || 0) > MAX_DISCOVERY_COURSES / 2 && (
          <div className="flex justify-center lg:hidden">
            <a
              role="button"
              className="flex items-center space-x-2 text-caption font-semibold text-brand-primary"
              onClick={onShowMore}
            >
              <span>
                {t(`dashboardHomePage.${showMore ? 'showLess' : 'showMore'}`)}
              </span>
              {showMore ? <ChevronUp /> : <ChevronDown />}
            </a>
          </div>
        )}
      </div>
    </>
  );
};
