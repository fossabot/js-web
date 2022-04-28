import { Dispatch, useEffect, useMemo, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';
import { getInstructorName } from '../course-session/getInstructorName';
import { useResponsive } from '../hooks/useResponsive';
import useTranslation from '../i18n/useTranslation';
import {
  ICourseSession,
  ICourseSessionCalendar,
  ICourseSessionInstructor,
} from '../models/course';
import Button from '../ui-kit/Button';
import { Check, Search } from '../ui-kit/icons';
import InputSelect, { IInputSelect } from '../ui-kit/InputSelect';
import { ProfilePic } from '../ui-kit/ProfilePic';
import { EventCalendarView, TopicFilter } from '../hooks/useSessionCalendar';
import cx from 'classnames';
import InputField from '../ui-kit/InputField';

const { theme } = resolveConfig(tailwindConfig);

const overrideStyles: IInputSelect['overrideStyles'] = {
  control: () => ({
    padding: `0px ${theme.padding['4']}`,
    border: 0,
    height: 'calc(100% - 1px)',
  }),
  valueContainer: () => ({
    padding: 0,
  }),
  option: (base, state) => ({
    paddingRight: state.isSelected ? '2.5rem' : '0',
    '::after': {
      top: '1.75rem',
    },
  }),
};

export interface IEventCalendarTopFiltersProps {
  calendarSessions: ICourseSession[];
  instructorId: ICourseSessionInstructor['id'] | null;
  setInstructorId: Dispatch<ICourseSessionInstructor['id'] | null>;
  topic: TopicFilter;
  setTopic: Dispatch<TopicFilter>;
  onClear: () => void;
  setView: Dispatch<EventCalendarView>;
}

export const EventCalendarTopFilters = ({
  calendarSessions,
  instructorId,
  setInstructorId,
  topic,
  setTopic,
  onClear,
  setView,
}: IEventCalendarTopFiltersProps) => {
  const { t } = useTranslation();
  const { lg } = useResponsive();

  const [showAllTopics, setShowAllTopics] = useState(false);
  const [showAllInstructors, setShowAllInstructors] = useState(false);

  const [search, setSearch] = useState('');

  const clear = () => {
    setShowAllTopics(false);
    setShowAllInstructors(false);
    setSearch('');
  };

  useEffect(() => {
    clear();
  }, [lg]);

  const [stickyTop, setStickyTop] = useState('65px');

  const { instructorOptions, learningWayOptions, topicOptions } =
    useMemo(() => {
      const instructorsMap: {
        [instructorId: string]: ICourseSessionInstructor;
      } = {};

      const topicMap: {
        [topicId: string]: ICourseSessionCalendar['courseTopics'][0];
      } = {};

      const learningWayMap: {
        [
          learningWayId: string
        ]: ICourseSessionCalendar['courseOutlineLearningWay'][0];
      } = {};

      if (calendarSessions) {
        for (const session of calendarSessions) {
          if (session.instructors) {
            for (const instructor of session.instructors) {
              instructorsMap[instructor.id] = instructor;
            }
          }

          if (session.courseTopics) {
            for (const topic of session.courseTopics) {
              topicMap[topic.id] = topic;
            }
          }

          if (session.courseOutlineLearningWay) {
            learningWayMap[session.courseOutlineLearningWay.id] =
              session.courseOutlineLearningWay;
          }
        }
      }

      return {
        instructorOptions: Object.values(instructorsMap).sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`,
          ),
        ),
        topicOptions: Object.values(topicMap).sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
        learningWayOptions: Object.values(learningWayMap).sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      };
    }, [calendarSessions]);

  useEffect(() => {
    setTimeout(() => {
      const header = document.querySelector(`[data-id="main-navbar"]`);

      if (header) {
        // + 1 for header border
        setStickyTop(`${header.clientHeight + 1}px`);
      }
    }, 1000);
    // make sure recalculate top value when layout changes
  }, [lg]);

  const renderInstructorValue = () => {
    return (
      <div className="flex items-center space-x-0 truncate lg:space-x-2">
        {instructorId === null ? (
          <div className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gray-300 bg-gray-200 text-footnote font-semibold lg:flex">
            {instructorOptions.length > 99 ? '99+' : instructorOptions.length}
          </div>
        ) : (
          <ProfilePic
            className="h-8 w-8 text-gray-300"
            imageKey={
              instructorOptions.find(
                (instructor) => instructor.id === instructorId,
              )?.profileImageKey
            }
          />
        )}
        <div className="truncate pr-14 font-bold lg:font-semibold">
          {instructorId === null
            ? t('eventCalendarPage.allInstructors')
            : getInstructorName(
                instructorOptions.find(
                  (instructor) => instructor.id === instructorId,
                ),
                t,
              )}
        </div>
      </div>
    );
  };

  const renderInstructorOption = (instructor: ICourseSessionInstructor) => {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <ProfilePic
            className="h-8 w-8 text-gray-300"
            imageKey={instructor.profileImageKey}
          />
          <div className="truncate">{getInstructorName(instructor, t)}</div>
        </div>
      </div>
    );
  };

  const renderTopic = () => {
    if (topic === null)
      return (
        <div className="truncate pr-14 font-bold">
          {t('eventCalendarPage.allTopics')}
        </div>
      );

    if (topic.type === 'learningWay')
      return learningWayOptions.find(
        (learningWay) => learningWay.id === topic.value,
      )?.name;

    if (topic.type === 'topic')
      return topicOptions.find((_topic) => _topic.id === topic.value)?.name;

    return null;
  };

  return (
    <>
      {lg ? (
        <div className="z-40 h-14 w-full lg:sticky" style={{ top: stickyTop }}>
          <div className="flex h-full border-b border-gray-200 bg-white">
            <div className="h-full flex-1 border-r border-gray-200">
              <InputSelect
                name="topic"
                selectClassWrapperName="h-full"
                selectClassName="h-full"
                onBlur={() => {
                  //
                }}
                onChange={(event) => {
                  setTopic(event.target.value);
                }}
                renderOptions={[
                  { label: t('eventCalendarPage.allTopics'), value: null },
                  {
                    label: t('eventCalendarPage.learningWay'),
                    options: learningWayOptions.map((learningWay) => ({
                      label: learningWay.name,
                      value: { type: 'learningWay', value: learningWay.id },
                    })),
                  },
                  {
                    label: t('eventCalendarPage.browseTopic'),
                    options: topicOptions.map((topic) => ({
                      label: topic.name,
                      value: { type: 'topic', value: topic.id },
                    })),
                  },
                ]}
                value={{ label: renderTopic(), value: topic }}
                overrideStyles={overrideStyles}
              />
            </div>
            <div className="h-full flex-1 border-r border-gray-200">
              <InputSelect
                name="instructors"
                selectClassWrapperName="h-full"
                selectClassName="h-full"
                onBlur={() => {
                  //
                }}
                isSearchable
                onChange={(event) => {
                  setInstructorId(event.target.value);
                }}
                renderOptions={[
                  { label: t('eventCalendarPage.allInstructors'), value: null },
                  ...instructorOptions.map((instructor) => ({
                    label: renderInstructorOption(instructor),
                    value: instructor.id,
                  })),
                ]}
                value={{ label: renderInstructorValue(), value: instructorId }}
                overrideStyles={overrideStyles}
              />
            </div>
            <div className="flex h-full items-center px-8">
              <a
                role="button"
                className="text-brand-primary"
                onClick={() => onClear()}
              >
                {t('eventCalendarPage.clear')}
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-4 bg-gray-100">
          <div className="w-full bg-white">
            <div className="px-6 py-4 text-subheading font-bold">
              {t('eventCalendarPage.topics')}
            </div>
            <a
              role="button"
              className={cx(
                'flex w-full items-center justify-between px-6 py-4 font-semibold',
                {
                  'text-brand-primary': topic === null,
                },
              )}
              onClick={() => setTopic(null)}
            >
              <span>{t('eventCalendarPage.allTopics')}</span>
              {topic === null && <Check />}
            </a>
            {topicOptions
              .slice(0, showAllTopics ? undefined : 3)
              .map((topicOption) => (
                <a
                  key={topicOption.id}
                  role="button"
                  className={cx(
                    'flex w-full items-center justify-between px-6 py-4 font-semibold',
                    {
                      'text-brand-primary':
                        topic?.type === 'topic' &&
                        topic?.value === topicOption.id,
                    },
                  )}
                  onClick={() =>
                    setTopic({ type: 'topic', value: topicOption.id })
                  }
                >
                  <span>{topicOption.name}</span>
                  {topic?.type === 'topic' &&
                    topic?.value === topicOption.id && <Check />}
                </a>
              ))}
            {topicOptions.length > 3 && (
              <a
                role="button"
                className={cx(
                  'flex w-full justify-between px-6 py-4 font-semibold text-brand-primary',
                )}
                onClick={() => setShowAllTopics(true)}
              >
                <span>
                  {t('eventCalendarPage.seeAllTopics')} (+{topicOptions.length})
                </span>
              </a>
            )}
          </div>
          <div className="w-full bg-white">
            <div className="px-6 py-4 text-subheading font-bold">
              {t('eventCalendarPage.instructors')}
            </div>
            <div className="px-6 py-4">
              <InputField
                name="search"
                placeholder="Search"
                iconLeft={<Search className="text-gray-300" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <a
              role="button"
              className={cx(
                'flex w-full items-center justify-between px-6 py-4 font-semibold',
                {
                  'text-brand-primary': instructorId === null,
                },
              )}
              onClick={() => setInstructorId(null)}
            >
              <span>{t('eventCalendarPage.allInstructors')}</span>
              {instructorId === null && <Check />}
            </a>
            {instructorOptions
              .filter((instructor) => {
                const query = search.trim().toLowerCase();
                if (!query) return true;
                const name =
                  `${instructor.firstName} ${instructor.lastName}`.toLowerCase();
                return name.includes(query);
              })
              .slice(0, showAllInstructors ? undefined : 3)
              .map((instructorOption) => (
                <a
                  key={instructorOption.id}
                  role="button"
                  className={cx(
                    'flex w-full items-center justify-between px-6 py-4 font-semibold',
                    {
                      'text-brand-primary':
                        instructorId === instructorOption.id,
                    },
                  )}
                  onClick={() => setInstructorId(instructorOption.id)}
                >
                  <span>{getInstructorName(instructorOption, t)}</span>
                  {instructorId === instructorOption.id && <Check />}
                </a>
              ))}
            {instructorOptions.length > 3 && (
              <a
                role="button"
                className={cx(
                  'flex w-full justify-between px-6 py-4 font-semibold text-brand-primary',
                )}
                onClick={() => setShowAllInstructors(true)}
              >
                <span>
                  {t('eventCalendarPage.seeAllInstructors')} (+
                  {instructorOptions.length})
                </span>
              </a>
            )}
          </div>
        </div>
      )}
      {!lg && (
        <div className="fixed bottom-0 flex w-full space-x-4 border-t border-gray-200 bg-white p-6">
          <Button
            variant="secondary"
            size="medium"
            onClick={() => {
              unstable_batchedUpdates(() => {
                setTopic(null);
                setInstructorId(null);
              });
            }}
          >
            {t('eventCalendarPage.clear')}
          </Button>
          <Button
            variant="primary"
            size="medium"
            onClick={() => {
              setView('sessions');
              clear();
            }}
          >
            {t('eventCalendarPage.apply')}
          </Button>
        </div>
      )}
    </>
  );
};
