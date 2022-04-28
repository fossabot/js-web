import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';
import { getDurationText } from '../course-detail/getDurationText';
import { useResponsive } from '../hooks/useResponsive';
import { useLocaleText } from '../i18n/useLocaleText';
import useTranslation from '../i18n/useTranslation';
import {
  ICourseOutline,
  ICourseSessionCalendar,
  ICourseSessionInstructor,
} from '../models/course';
import { Language } from '../models/language';
import {
  ArrowLeft,
  Check,
  ClockGray,
  DoorOpen,
  Filter,
  SoundUpGray,
} from '../ui-kit/icons';
import InputSelect, { IInputSelect } from '../ui-kit/InputSelect';
import { ProfilePic } from '../ui-kit/ProfilePic';
import { getInstructorName } from './getInstructorName';

const { theme } = resolveConfig(tailwindConfig);

interface CourseSessionFiltersProps {
  courseOutlines: ICourseOutline<Language>[];
  calendarSessions: ICourseSessionCalendar[] | null;
  outlineId: string;
  onChangeOutline: (outlineId: string) => void;

  instructorIds: string[];
  onChangeInstructors: (instructorIds: string[]) => void;

  language: 'en' | 'th' | 'any';
  onChangeLanguage: (lang: 'en' | 'th' | 'any') => void;
}

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

export const CourseSessionFilters = ({
  courseOutlines,
  calendarSessions,
  outlineId,
  language,
  instructorIds,
  onChangeInstructors,
  onChangeLanguage,
  onChangeOutline,
}: CourseSessionFiltersProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const localeText = useLocaleText();
  const { lg } = useResponsive();

  const [stickyTop, setStickyTop] = useState('0px');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (!lg) {
      setShowMobileFilters(false);
    }
  }, [lg]);

  const { instructorsPerOutline, sessionsPerOutline } = useMemo(() => {
    const instructorsPerOutline: {
      [outlineId: string]: { [instructorId: string]: ICourseSessionInstructor };
    } = {};
    const sessionsPerOutline: { [outlineId: string]: number } = {};
    if (calendarSessions) {
      calendarSessions.forEach((session) => {
        courseOutlines.forEach((outline) => {
          if (sessionsPerOutline[outline.id] === undefined)
            sessionsPerOutline[outline.id] = 0;
          if (outline.id === session.courseOutlineId)
            sessionsPerOutline[outline.id] = outline.availableSessionCount;
        });

        if (instructorsPerOutline[session.courseOutlineId] === undefined)
          instructorsPerOutline[session.courseOutlineId] = {};
        for (const instructor of session.instructors) {
          instructorsPerOutline[session.courseOutlineId][instructor.id] =
            instructor;
        }
      });
    }
    return { instructorsPerOutline, sessionsPerOutline };
  }, [calendarSessions, courseOutlines]);

  const courseOutlineMap = useMemo(() => {
    const map: { [id: string]: ICourseOutline<Language> } = {};
    for (const outline of courseOutlines) {
      map[outline.id] = outline;
    }
    return map;
  }, [courseOutlines]);

  useEffect(() => {
    setTimeout(() => {
      const header = document.querySelector(`[data-id="main-navbar"]`);

      if (header) {
        // + 1 for header border
        setStickyTop(`${header.clientHeight + 1}px`);
      }
    }, 0);
    // make sure recalculate top value when layout changes
  }, [lg]);

  const renderOutlineOption = (outline: ICourseOutline<Language>) => {
    const instructors = Object.values(instructorsPerOutline[outline.id] || {});

    return (
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-heading font-bold text-black">
              {String(outline.part).padStart(2, '0')}
            </span>
            <span className="text-subheading font-bold text-black">
              {localeText(outline.title)}
            </span>
          </div>
          <div className="hidden items-center space-x-4 lg:flex">
            <div className="flex items-center space-x-1">
              <DoorOpen keepColor />
              <span className="text-caption text-gray-500">
                {sessionsPerOutline[outline.id] || 0}{' '}
                {sessionsPerOutline[outline.id] === 1
                  ? t('courseSessionsPage.openSession')
                  : t('courseSessionsPage.openSessions')}
              </span>
            </div>
            <div className="w-px self-stretch bg-gray-400"></div>
            <div className="flex items-center space-x-1">
              <ClockGray width="1.25rem" height="1.25rem" />
              <span className="text-caption text-gray-500">
                {getDurationText(outline, t)}
              </span>
            </div>
          </div>
        </div>
        <div className="hidden flex-shrink-0 items-center space-x-1 lg:flex">
          {instructors.slice(0, 5).map((instructor) => (
            <ProfilePic
              key={instructor.id}
              className="h-8 w-8 text-gray-300 "
              imageKey={instructor.profileImageKey}
            />
          ))}
          {instructors.length > 5 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-white">
              <span>+{instructors.length - 5}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOutlineValue = (outlineId: string) => {
    const outline = courseOutlineMap[outlineId];

    if (!outline) return null;

    return (
      <div className="flex items-center space-x-2">
        <span className="font-semibold">
          {String(outline.part).padStart(2, '0')}
        </span>
        <span className="text-caption font-semibold text-gray-650">
          {localeText(outline.title)}
        </span>
      </div>
    );
  };

  const renderInstructorValue = () => {
    const outlineInstructorIds = instructorIds.filter(
      (id) => instructorsPerOutline[outlineId]?.[id] !== undefined,
    );

    return (
      <div className="flex items-center space-x-0 truncate lg:space-x-2">
        <div className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gray-300 bg-gray-200 text-footnote font-semibold lg:flex">
          {Object.keys(instructorsPerOutline[outlineId] || {}).length}
        </div>
        <div className="truncate pr-14 font-bold lg:font-semibold">
          {outlineInstructorIds.length === 0
            ? 'Any instructor'
            : outlineInstructorIds.length === 1
            ? getInstructorName(
                instructorsPerOutline[outlineId]?.[outlineInstructorIds[0]],
                t,
              )
            : `${outlineInstructorIds.length} instructors`}
        </div>
      </div>
    );
  };

  const renderInstructorOption = (instructor: ICourseSessionInstructor) => {
    return (
      <div className="flex items-center justify-between">
        <div className="flex flex-shrink-0 items-center space-x-2 truncate">
          <ProfilePic
            imageKey={instructor.profileImageKey}
            className="h-8 w-8 text-gray-300"
            style={{ minWidth: '2rem' }}
          />
          <div className="truncate">{getInstructorName(instructor, t)}</div>
        </div>

        {instructorIds.find((id) => id === instructor.id) && (
          <Check className="flex-shrink-0 text-brand-primary"></Check>
        )}
      </div>
    );
  };

  const languageOptions = [
    { label: t('courseSessionsPage.anyLanguage'), value: 'any' },
    { label: 'Thai', value: 'th' },
    { label: 'English', value: 'en' },
  ];

  const renderLanguageValue = (language: string) => {
    const label = languageOptions.find(
      (option) => option.value === language,
    )?.label;

    return (
      <div className="flex items-center space-x-0 truncate lg:space-x-2">
        <SoundUpGray className="hidden lg:inline" />
        <div className="truncate pr-14 font-bold lg:font-semibold">{label}</div>
      </div>
    );
  };

  const instructorsSelect = (
    <div
      className="border-r border-gray-200"
      style={lg ? { minWidth: '15rem', maxWidth: '15rem' } : { flex: 1 }}
    >
      <InputSelect
        name="instructors"
        selectClassWrapperName="h-full"
        selectClassName="h-full"
        onBlur={() => {
          //
        }}
        onChange={(event) => {
          const instructorId = event.target.value;

          if (instructorIds.find((id) => id === instructorId) !== undefined) {
            onChangeInstructors(
              instructorIds.filter((id) => id !== instructorId),
            );
          } else {
            onChangeInstructors([...instructorIds, instructorId]);
          }
        }}
        renderOptions={Object.values(
          instructorsPerOutline[outlineId] || {},
        ).map((instructor) => ({
          label: renderInstructorOption(instructor),
          value: instructor.id,
        }))}
        value={{
          label: renderInstructorValue(),
          value: instructorIds,
        }}
        overrideStyles={overrideStyles}
        closeMenuOnSelect={false}
      />
    </div>
  );

  const languageSelect = (
    <div style={lg ? { minWidth: '15rem', maxWidth: '15rem' } : { flex: 1 }}>
      <InputSelect
        name="language"
        selectClassWrapperName="h-full"
        selectClassName="h-full"
        onBlur={() => {
          //
        }}
        onChange={(event) => {
          onChangeLanguage(event.target.value);
        }}
        renderOptions={languageOptions}
        value={{
          label: renderLanguageValue(language),
          value: language,
        }}
        overrideStyles={{ ...overrideStyles, option: () => ({}) }}
      />
    </div>
  );

  return (
    <div className="fixed z-10 w-full lg:sticky" style={{ top: stickyTop }}>
      <div className="flex border-b border-gray-200 bg-white">
        <a
          role="button"
          className="outline-none focus:outline-none hidden items-center space-x-2 border-r border-gray-200 py-4 px-6 text-caption font-semibold focus:border-gray-200 active:bg-gray-100 lg:flex"
          onClick={() => router.back()}
        >
          <ArrowLeft />
          <span>{t('courseSessionsPage.goBack')}</span>
        </a>
        <div className="flex-1 border-r border-gray-200">
          <InputSelect
            name="course-outline"
            selectClassWrapperName="h-full"
            selectClassName="h-full"
            onBlur={() => {
              //
            }}
            onChange={(event) => {
              onChangeOutline(event.target.value);
            }}
            renderOptions={[...courseOutlines]
              .sort((a, b) => a.part - b.part)
              .map((outline) => ({
                label: renderOutlineOption(outline),
                value: outline.id,
              }))}
            value={{
              label: renderOutlineValue(outlineId),
              value: outlineId,
            }}
            overrideStyles={overrideStyles}
          />
        </div>
        {lg && (
          <>
            {instructorsSelect}
            {languageSelect}
          </>
        )}
        <button
          type="button"
          className="outline-none focus:outline-none flex items-center justify-center p-4 active:bg-gray-100 lg:hidden"
          onClick={() => {
            setShowMobileFilters(!showMobileFilters);
          }}
        >
          <Filter />
        </button>
      </div>
      {showMobileFilters && !lg && (
        <div
          className="flex border-b border-gray-200 bg-white"
          style={{ minHeight: '3.375rem' }}
        >
          {instructorsSelect}
          {languageSelect}
        </div>
      )}
    </div>
  );
};
