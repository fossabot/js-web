import uniqBy from 'lodash/uniqBy';
import { FormikProps, useFormik } from 'formik';

import { centralHttp } from '../../../http';
import Button from '../../../ui-kit/Button';
import { Close } from '../../../ui-kit/icons';
import { ICourse } from '../../../models/course';
import { Language } from '../../../models/language';
import API_PATHS from '../../../constants/apiPaths';
import InputSelect from '../../../ui-kit/InputSelect';
import InputField from '../../../ui-kit/InputField';
import useTranslation from '../../../i18n/useTranslation';
import { getLanguageValue } from '../../../i18n/lang-utils';
import { ILearningTrack } from '../../../models/learningTrack';
import { CertificationType } from '../../../models/certificate';
import useMultiAsyncInput from '../../../hooks/useMultiAsyncInput';
import {
  ICertificateUnlockRule,
  ICertificateUnlockRuleCourseItem,
  ICertificateUnlockRuleLearningTrackItem,
} from '../../../models/certificateUnlockRule';

const UnlockItem = ({
  index,
  title,
  itemLength,
  percentage,
  onPercentageChange,
  onRemoveItem,
  type,
}: {
  index: number;
  itemLength: number;
  title: Language | string;
  percentage?: number;
  item?: Partial<ICourse<Language>> | Partial<ILearningTrack<Language>>;
  onPercentageChange: (index: number, percentage: number) => void;
  onRemoveItem: (index: number) => void;
  type: CertificationType;
}) => {
  if (itemLength < 1) return;

  function handlePercentageChange(index: number, value: string) {
    const parsed = Number(value);
    const rawPercentage = Number.isNaN(parsed) ? 0 : parsed;
    const percentage =
      rawPercentage > 100 ? 100 : rawPercentage < 0 ? 0 : rawPercentage;
    onPercentageChange?.(index, percentage);
  }

  return (
    <li className="mb-2 flex w-full flex-row items-center border border-gray-400 p-4 shadow">
      <div className="flex-1">
        {typeof title === 'string' ? title : getLanguageValue(title)}
      </div>
      {type === CertificationType.COURSE && (
        <span className="flex items-center">
          <span className="mr-2 whitespace-nowrap text-caption">
            Progress required:
          </span>
          <InputField
            name="percentage"
            type="number"
            min={1}
            max={100}
            step={1}
            value={percentage}
            onChange={(e) => handlePercentageChange(index, e.target.value)}
            onBlur={(e) => handlePercentageChange(index, e.target.value)}
          />
          %
        </span>
      )}
      <div className="flex items-start justify-end">
        <span className="pl-1">
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={() => onRemoveItem(index)}
          >
            <Close />
          </Button>
        </span>
      </div>
    </li>
  );
};

const CertificateUnlockRuleItemForm = ({
  formik,
  type,
  items,
  onPercentageChange,
}: {
  formik: FormikProps<ICertificateUnlockRule>;
  type: CertificationType;
  items?:
    | ICertificateUnlockRuleCourseItem[]
    | ICertificateUnlockRuleLearningTrackItem[];
  onPercentageChange: (index: number, percentage: number) => void;
}) => {
  const { t } = useTranslation();

  const localFormik = useFormik({
    initialValues: {
      ids: [],
    },
    onSubmit: handleSubmit,
  });

  const { options, getOptions, inputValues, onValueChange } =
    useMultiAsyncInput({
      http: centralHttp.get,
      apiPath:
        type === CertificationType.COURSE
          ? API_PATHS.COURSES
          : API_PATHS.LEARNING_TRACKS,
      fieldName: 'title',
      formikFieldValue: localFormik.values.ids,
    });

  function handleSubmit({ ids }: { ids: string[] }) {
    const idKeyName =
      type === CertificationType.COURSE ? 'courseId' : 'learningTrackId';
    const itemKeyName =
      type === CertificationType.COURSE ? 'course' : 'learningTrack';
    const currentItems = options
      .filter((it) => ids.includes(it.id))
      .map((i) => ({
        [idKeyName]: i.id,
        percentage: 100,
        [itemKeyName]: i,
      }));

    const newArr = uniqBy([...items, ...currentItems], idKeyName);
    localFormik.setValues({
      ids: [],
    });

    formik.setFieldValue(
      type === CertificationType.COURSE
        ? 'unlockCourseRuleItems'
        : 'unlockLearningTrackRuleItems',
      newArr,
    );
    formik.setFieldValue(
      type === CertificationType.COURSE
        ? 'unlockLearningTrackRuleItems'
        : 'unlockCourseRuleItems',
      [],
    );
  }

  function onRemoveItem(i) {
    const arr = [...items];
    arr.splice(i, 1);

    formik.setFieldValue(
      type === CertificationType.COURSE
        ? 'unlockCourseRuleItems'
        : 'unlockLearningTrackRuleItems',
      arr,
    );
  }

  return (
    <div className="m-3 rounded-md px-3 pt-6 pb-1 text-left">
      <div className="mb-3 text-subheading font-bold">
        {type === CertificationType.COURSE ? 'Courses' : 'Learning Tracks'}
      </div>
      <InputSelect
        formik={localFormik}
        name="ids"
        label={
          type === CertificationType.COURSE
            ? 'Select courses'
            : 'Select learning tracks'
        }
        value={inputValues}
        isAsync={true}
        isMulti={true}
        isSearchable={true}
        promiseOptions={getOptions}
        placeholder={t('certificateUnlockRuleCreatePage.pleaseSelect')}
        onBlur={localFormik.handleBlur}
        selectClassWrapperName="my-4"
        onChange={(e) => {
          onValueChange(e.target.value);
          localFormik.handleChange(e);
        }}
        error={localFormik.touched.ids && localFormik.errors.ids}
      />
      <div className="mb-2 lg:flex lg:justify-end">
        <div className="lg:w-1/4">
          <Button
            type="button"
            variant="primary"
            size="medium"
            onClick={() => handleSubmit(localFormik.values)}
          >
            Add
          </Button>
        </div>
      </div>
      {items.map((cri, index) => {
        return (
          <UnlockItem
            key={index}
            item={cri}
            index={index}
            title={
              type === CertificationType.COURSE
                ? cri.course?.title
                : cri.learningTrack.title
            }
            percentage={cri.percentage}
            onRemoveItem={onRemoveItem}
            onPercentageChange={onPercentageChange}
            itemLength={items.length}
            type={type}
          />
        );
      })}
    </div>
  );
};

export default CertificateUnlockRuleItemForm;
