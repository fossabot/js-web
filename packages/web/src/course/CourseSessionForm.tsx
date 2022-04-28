import { getIn } from 'formik';
import { FaTrash } from 'react-icons/fa';

import DatePicker from 'react-datepicker';

import 'react-quill/dist/quill.snow.css';
import 'react-datepicker/dist/react-datepicker.css';

import { centralHttp } from '../http';
import Button from '../ui-kit/Button';
import API_PATHS from '../constants/apiPaths';
import InputSelect from '../ui-kit/InputSelect';
import InputSection from '../ui-kit/InputSection';
import { CourseLanguage, ICourseOutline } from '../models/course';
import useTranslation from '../i18n/useTranslation';
import useMultiAsyncInput from '../hooks/useMultiAsyncInput';
import { enumToArray } from '../utils/array';
import { Language } from '../models/language';
import InputCheckbox from '../ui-kit/InputCheckbox';

const CourseSessionForm = ({
  formik,
  index,
  courseOutline,
  onRemoveCourseSession,
  courseOutlineNamePrefix,
}: {
  formik: any;
  index: number;
  courseOutline: ICourseOutline<Language>;
  courseOutlineNamePrefix: string;
  onRemoveCourseSession: (arg: number) => void;
}) => {
  const { t } = useTranslation();
  const courseSession = courseOutline.courseSessions[index];
  const courseSessionPrefix = `${courseOutlineNamePrefix}.courseSessions[${index}]`;

  const {
    getOptions: getInstructorOptions,
    inputValues: instructorInputValues,
    onValueChange: onInstructorsValueChange,
  } = useMultiAsyncInput({
    fieldName: 'email',
    http: centralHttp.get,
    apiPath: API_PATHS.ADMIN_USERS,
    apiParams: { role: 'INSTRUCTOR' },
    formikFieldValue: courseSession.instructorsIds,
    initialSelectedOptions: courseSession?.instructors,
  });

  return (
    <div
      className="mb-6 w-full rounded border border-gray-400 bg-gray-100 p-4 shadow-sm"
      key={index}
    >
      {courseOutline?.courseSessions.length > 1 ? (
        <div className="flex w-full flex-col items-end justify-end">
          <div className="mb-3 w-1/3 text-right">
            <Button
              iconLeft={
                <FaTrash
                  className="text-grey-400 mr-2 h-5 w-5"
                  aria-hidden="true"
                />
              }
              size="medium"
              variant="secondary"
              type="button"
              className="items-end"
              onClick={() => onRemoveCourseSession(index)}
            >
              Remove course session
            </Button>
          </div>
        </div>
      ) : null}
      <InputSection
        formik={formik}
        label={t('courseOutlineForm.seats') + ' *'}
        type="number"
        name={`${courseSessionPrefix}.seats`}
        placeholder={t('courseOutlineForm.seats')}
        inputWrapperClassName="mb-3"
        value={courseSession.seats || 0}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        error={
          getIn(formik.touched, `${courseSessionPrefix}.seats`) &&
          getIn(formik.errors, `${courseSessionPrefix}.seats`)
        }
      />
      {courseSession.isDraft || !courseSession.id ? (
        <InputSection
          label="Is draft"
          name="Is Draft"
          disabled
          placeholder="Is Draft"
          inputWrapperClassName="mb-3"
          value={courseSession.isDraft || !courseSession.id ? 'Yes' : 'No'}
        />
      ) : null}
      <InputSelect
        name={`${courseSessionPrefix}.language`}
        formik={formik}
        label={t('courseOutlineForm.language') + ' *'}
        options={enumToArray(CourseLanguage)}
        value={{
          label: enumToArray(CourseLanguage).find(
            (item) => item === courseSession?.language,
          )
            ? enumToArray(CourseLanguage).find(
                (item) => item === courseSession?.language,
              )
            : t('courseOutlineForm.pleaseSelect'),
          value: courseSession?.language,
        }}
        placeholder={t('courseOutlineForm.pleaseSelect')}
        onBlur={formik.handleBlur}
        selectClassWrapperName="w-100 mb-3"
        onChange={formik.handleChange}
        error={
          getIn(formik.touched, `${courseSessionPrefix}.language`) &&
          getIn(formik.errors, `${courseSessionPrefix}.language`)
        }
      />
      <InputSection
        formik={formik}
        label={t('courseOutlineForm.webinarTool')}
        name={`${courseSessionPrefix}.webinarTool`}
        placeholder={t('courseOutlineForm.webinarTool')}
        inputWrapperClassName="mb-3"
        onBlur={formik.handleBlur}
        value={courseSession.webinarTool}
        onChange={formik.handleChange}
      />
      <InputSection
        formik={formik}
        label={t('courseOutlineForm.location')}
        name={`${courseSessionPrefix}.location`}
        placeholder={t('courseOutlineForm.location')}
        inputWrapperClassName="mb-3"
        onBlur={formik.handleBlur}
        value={courseSession.location}
        onChange={formik.handleChange}
      />
      <InputSection
        formik={formik}
        label={t('courseOutlineForm.participantUrl')}
        name={`${courseSessionPrefix}.participantUrl`}
        placeholder={t('courseOutlineForm.participantUrl')}
        inputWrapperClassName="mb-3"
        onBlur={formik.handleBlur}
        value={courseSession.participantUrl}
        onChange={formik.handleChange}
        error={
          getIn(formik.touched, `${courseSessionPrefix}.participantUrl`) &&
          getIn(formik.errors, `${courseSessionPrefix}.participantUrl`)
        }
      />
      <div className="mb-3 flex w-full flex-col items-start">
        <label
          htmlFor={`${courseSessionPrefix}.startDateTime`}
          className={'mb-2 text-caption font-bold'}
        >
          {t('courseOutlineForm.startDateTime') + ' *'}
        </label>
        <DatePicker
          className="outline-none z-0 w-full rounded-lg border bg-white px-4 py-2 text-body disabled:opacity-50"
          timeInputLabel="Time:"
          dateFormat="MM/dd/yyyy h:mm aa"
          showTimeInput
          showPopperArrow={false}
          name={`${courseSessionPrefix}.startDateTime`}
          onChange={(date) => {
            formik.handleChange({
              target: {
                value: date.toISOString(),
                name: `${courseSessionPrefix}.startDateTime`,
              },
            });
          }}
          selected={new Date(courseSession.startDateTime)}
        />
      </div>
      <div className="mb-3 flex w-full flex-col items-start">
        <label
          htmlFor={`${courseSessionPrefix}.endDateTime`}
          className={'mb-2 text-caption font-bold'}
        >
          {t('courseOutlineForm.endDateTime') + ' *'}
        </label>
        <DatePicker
          className="outline-none z-0 w-full rounded-lg border bg-white px-4 py-2 text-body disabled:opacity-50"
          timeInputLabel="Time:"
          dateFormat="MM/dd/yyyy h:mm aa"
          showTimeInput
          showPopperArrow={false}
          name={`${courseSessionPrefix}.endDateTime`}
          onChange={(date) => {
            formik.handleChange({
              target: {
                value: date.toISOString(),
                name: `${courseSessionPrefix}.endDateTime`,
              },
            });
          }}
          selected={new Date(courseSession.endDateTime)}
        />
      </div>
      <InputSelect
        name={`${courseSessionPrefix}.instructorsIds`}
        formik={formik}
        label={t('courseOutlineForm.instructors') + ' *'}
        value={instructorInputValues}
        promiseOptions={getInstructorOptions}
        placeholder={t('courseOutlineForm.pleaseSelect')}
        onBlur={formik.handleBlur}
        selectClassWrapperName="mb-3"
        onChange={(e) => {
          onInstructorsValueChange(e.target.value);
          formik.handleChange(e);
        }}
        isMulti={true}
        isAsync={true}
        isSearchable={true}
      />
      <label
        htmlFor={`${courseSessionPrefix}.isPrivate`}
        className="mb-3 block text-caption font-bold"
      >
        {t('courseOutlineForm.isPrivateSession')}
      </label>
      <InputCheckbox
        formik={formik}
        label={t('courseOutlineForm.isPrivateSession')}
        name={`${courseSessionPrefix}.isPrivate`}
        inputWrapperClassName="mb-3"
        checked={courseSession.isPrivate}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
      />
    </div>
  );
};

export default CourseSessionForm;
