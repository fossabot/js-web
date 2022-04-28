import { useState } from 'react';
import API_PATHS from '../../constants/apiPaths';
import useMultiAsyncInput from '../../hooks/useMultiAsyncInput';
import { centralHttp } from '../../http';
import { useLocaleText } from '../../i18n/useLocaleText';
import useTranslation from '../../i18n/useTranslation';
import { ICourseDiscovery } from '../../models/course-discovery';
import Button from '../../ui-kit/Button';
import InputSelect from '../../ui-kit/InputSelect';
import MenuItems from '../catalog-menu/MenuItems';

interface ICourseDiscoveryListSectionProps {
  sectionLabel: string;
  emptyLabel: string;
  courses: ICourseDiscovery[];
  onAdd: (courses: ICourseDiscovery[]) => void;
  onRemove: (id: string) => void;
  onSwap: (currentIndex: number, newIndex: number) => void;
}

export const CourseDiscoveryListSection = ({
  courses,
  sectionLabel,
  emptyLabel,
  onAdd,
  onRemove,
  onSwap,
}: ICourseDiscoveryListSectionProps) => {
  const { t } = useTranslation();
  const localeText = useLocaleText();
  const [courseIds, setCourseIds] = useState([]);

  const {
    options: courseOptions,
    getOptions: getCourseOptions,
    inputValues: courseInputValues,
    onValueChange: onCoursesValueChange,
  } = useMultiAsyncInput({
    http: centralHttp.get,
    apiPath: API_PATHS.COURSES,
    formikFieldValue: courseIds,
    fieldName: 'title',
  });

  return (
    <div className="space-y-4 p-4 shadow lg:w-2/3">
      <h4 className="text-subheading font-semibold">{sectionLabel}</h4>
      <div className="flex items-center space-x-4">
        <InputSelect
          name="topicIds"
          label={t('courseDiscoveryManagementPage.courses')}
          value={courseInputValues}
          isAsync={true}
          isMulti={true}
          isSearchable={true}
          promiseOptions={getCourseOptions}
          placeholder={t('courseDiscoveryManagementPage.pleaseSelect')}
          onBlur={() => {
            //
          }}
          selectClassWrapperName="my-4"
          onChange={(e) => {
            setCourseIds(e.target.value);
            onCoursesValueChange(e.target.value);
          }}
        />
        <Button
          type="submit"
          variant="primary"
          size="medium"
          avoidFullWidth
          className="mt-6"
          onClick={() => {
            onAdd(
              courseIds
                .map((id) => courseOptions.find((course) => course.id === id))
                .filter((course) => !!course),
            );
            setCourseIds([]);
          }}
        >
          {t('courseDiscoveryManagementPage.add')}
        </Button>
      </div>
      <MenuItems
        items={courses.map((course) => ({
          id: course.id,
          name: localeText(course.title),
        }))}
        handleSwapElement={onSwap}
        handleRemove={({ id }) => onRemove(id)}
        emptyText={emptyLabel}
      />
    </div>
  );
};
