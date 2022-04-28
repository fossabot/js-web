import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

import Button from '../../ui-kit/Button';
import CheckBox from '../../ui-kit/CheckBox';
import { enumToArray } from '../../utils/array';
import WEB_PATHS from '../../constants/webPaths';
import InputSelect from '../../ui-kit/InputSelect';
import InputSection from '../../ui-kit/InputSection';
import {
  CourseLanguage,
  CourseSubCategoryKey,
  WebinarTool,
} from '../../models/course';
import useTranslation from '../../i18n/useTranslation';
import InstructorOverlapModal from './InstructorOverlapModal';
import InputRadio from '../../ui-kit/InputRadio';
import { useEffect, useState } from 'react';
import { InputSectionWithSelect } from '../../ui-kit/InputSectionWithSelect';

const SessionForm = ({
  formik,
  router,
  courseSession,
  instructorOverlapModalData,
  instructorOverlapModalProps,
  outlineInputValue,
  getOutlineOptions,
  instructorInputValue,
  getInstructorOptions,
  outlineOptions,
}) => {
  const { t } = useTranslation();
  const [sessionStyle, setSessionStyle] = useState<CourseSubCategoryKey>();

  const isStartAndEndTimeDisabled =
    courseSession && new Date() >= new Date(courseSession.startDateTime);

  useEffect(() => {
    const outline = outlineOptions.find(
      (opt) => opt.id === formik.values.courseOutlineId,
    );
    setSessionStyle(outline?.category.key);
  }, [formik.values.courseOutlineId, outlineOptions]);

  useEffect(() => {
    if (sessionStyle === CourseSubCategoryKey.VIRTUAL) {
      formik.setFieldValue('location', courseSession?.location);
    }
    if (sessionStyle === CourseSubCategoryKey.FACE_TO_FACE) {
      formik.setFieldValue('webinarTool', courseSession?.webinarTool);
      formik.setFieldValue('participantUrl', courseSession?.participantUrl);
    }
  }, [sessionStyle]);

  return (
    <form onSubmit={formik.handleSubmit} autoComplete="off">
      <InputSelect
        name="courseOutlineId"
        formik={formik}
        label="Course Outline*"
        value={{
          label: outlineInputValue?.label || 'Please select',
          value: outlineInputValue?.value,
        }}
        promiseOptions={getOutlineOptions}
        placeholder="'Select..."
        onBlur={formik.handleBlur}
        selectClassWrapperName="mb-4"
        onChange={formik.handleChange}
        isAsync={true}
        isSearchable={true}
        isDisabled={!!courseSession}
        error={formik.touched.courseOutlineId && formik.errors.courseOutlineId}
      />
      <div className="mb-4 flex flex-row space-x-4">
        <div className="flex w-full flex-col items-start">
          <label
            htmlFor="startDateTime"
            className="mb-2 text-caption font-semibold"
          >
            {t('courseOutlineForm.startDateTime')}*
          </label>
          <DatePicker
            className="outline-none z-0 w-full rounded-lg border bg-white px-4 py-2 text-body disabled:opacity-50"
            timeInputLabel="Time:"
            dateFormat="MM/dd/yyyy h:mm aa"
            showTimeInput
            showPopperArrow={false}
            name="startDateTime"
            disabled={isStartAndEndTimeDisabled}
            onChange={(date) => {
              if (date)
                formik.handleChange({
                  target: {
                    value: date.toISOString(),
                    name: 'startDateTime',
                  },
                });
            }}
            selected={new Date(formik.values.startDateTime)}
          />
          {formik.errors.startDateTime && (
            <p className="pt-2 text-footnote text-red-200">
              {t(formik.errors.startDateTime)}
            </p>
          )}
        </div>
        <div className="flex w-full flex-col items-start">
          <label
            htmlFor="endDateTime"
            className="mb-2 text-caption font-semibold"
          >
            {t('courseOutlineForm.endDateTime')}*
          </label>
          <DatePicker
            className="outline-none z-0 w-full rounded-lg border bg-white px-4 py-2 text-body disabled:opacity-50"
            timeInputLabel="Time:"
            dateFormat="MM/dd/yyyy h:mm aa"
            showTimeInput
            showPopperArrow={false}
            name="endDateTime"
            disabled={isStartAndEndTimeDisabled}
            onChange={(date) => {
              if (date)
                formik.handleChange({
                  target: {
                    value: date.toISOString(),
                    name: 'endDateTime',
                  },
                });
            }}
            selected={new Date(formik.values.endDateTime)}
          />
          {formik.errors.endDateTime && (
            <p className="pt-2 text-footnote text-red-200">
              {t(formik.errors.endDateTime)}
            </p>
          )}
        </div>
      </div>
      <InputSelect
        name="instructorId"
        formik={formik}
        label="Instructor*"
        value={{
          label: instructorInputValue?.label || 'Please select',
          value: instructorInputValue?.value,
        }}
        promiseOptions={getInstructorOptions}
        placeholder="'Select..."
        onBlur={formik.handleBlur}
        selectClassWrapperName="mb-4"
        onChange={formik.handleChange}
        isAsync={true}
        isSearchable={true}
        error={formik.touched.instructorId && formik.errors.instructorId}
      />
      <div className="mb-4 flex flex-col">
        <span className="mb-2 text-caption font-bold">Session style</span>
        <div className="flex flex-row space-x-4">
          <InputRadio
            name="courseOutlineCategory"
            label="Virtual"
            inputWrapperClassName="w-full"
            disabled={sessionStyle !== CourseSubCategoryKey.VIRTUAL}
            checked={sessionStyle === CourseSubCategoryKey.VIRTUAL}
            onChange={() => setSessionStyle(CourseSubCategoryKey.VIRTUAL)}
          />
          <InputRadio
            name="courseOutlineCategory"
            label="Face to Face"
            inputWrapperClassName="w-full"
            disabled={sessionStyle !== CourseSubCategoryKey.FACE_TO_FACE}
            checked={sessionStyle === CourseSubCategoryKey.FACE_TO_FACE}
            onChange={() => setSessionStyle(CourseSubCategoryKey.FACE_TO_FACE)}
          />
        </div>
      </div>
      <div className="mb-4 flex flex-col">
        {sessionStyle === CourseSubCategoryKey.VIRTUAL && (
          <>
            <span className="mb-2 text-caption font-bold">
              Webinar Tool & URL*
            </span>
            <InputSectionWithSelect
              inputSelectProps={{
                name: 'webinarTool',
                onChange: formik.handleChange,
                onBlur: formik.handleBlur,
                value:
                  formik.values.webinarTool !== ''
                    ? {
                        label: formik.values.webinarTool,
                        value: formik.values.webinarTool,
                      }
                    : undefined,
                placeholder: 'Select...',
                options: [
                  WebinarTool.ZOOM,
                  WebinarTool.GOOGLE_MEET,
                  WebinarTool.MICROSOFT_TEAMS,
                  WebinarTool.OTHERS,
                ],
              }}
              inputSectionProps={{
                formik,
                placeholder: 'Paste URL',
                type: 'text',
                name: 'participantUrl',
                value: formik.values.participantUrl,
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
                error:
                  formik.touched.participantUrl && formik.errors.participantUrl,
              }}
            />
          </>
        )}
        {sessionStyle === CourseSubCategoryKey.FACE_TO_FACE && (
          <InputSection
            formik={formik}
            label="Location"
            placeholder="Location"
            type="text"
            name="location"
            value={formik.values.location}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
        )}
      </div>
      <div className="mb-4 flex flex-row space-x-4">
        <InputSection
          formik={formik}
          label="Seats*"
          type="number"
          name="seats"
          placeholder="Seats"
          min={0}
          inputFieldWrapperClassName="flex h-full"
          value={formik.values.seats}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          error={formik.touched.seats && formik.errors.seats}
        />
        <InputSelect
          name="language"
          formik={formik}
          label="Language*"
          options={enumToArray(CourseLanguage)}
          value={{
            label: enumToArray(CourseLanguage).find(
              (item) => item === formik.values.language,
            )
              ? enumToArray(CourseLanguage)
                  .find((item) => item === formik.values.language)
                  .toUpperCase()
              : 'Please select',
            value: formik.values.language,
          }}
          placeholder="Please select"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          error={formik.touched.language && formik.errors.language}
        />
      </div>
      <div className="mb-4 flex flex-col">
        <span className="mb-2 text-caption font-bold">Session type</span>
        <div className="flex flex-row space-x-4">
          <label className="flex w-full cursor-pointer items-center space-x-3 rounded-lg border border-gray-300 px-4 py-2">
            <CheckBox
              type="round"
              name="isPrivate"
              onBlur={formik.handleBlur}
              onChange={() => formik.setFieldValue('isPrivate', false)}
              inputClassName={'cursor-pointer'}
              value={undefined}
              checked={!formik.values.isPrivate}
            />
            <span className="text-body">Public</span>
          </label>
          <label className="flex w-full cursor-pointer items-center space-x-3 rounded-lg border border-gray-300 px-4 py-2">
            <CheckBox
              type="round"
              name="isPrivate"
              onBlur={formik.handleBlur}
              onChange={() => formik.setFieldValue('isPrivate', true)}
              inputClassName={'cursor-pointer'}
              value={undefined}
              checked={formik.values.isPrivate}
            />
            <span className="text-body">Private</span>
          </label>
        </div>
      </div>
      <div className="flex h-full flex-row items-end justify-end space-x-4 py-6">
        <Button
          size="medium"
          variant="ghost"
          type="button"
          className="w-29 text-black"
          avoidFullWidth
          onClick={() =>
            router.push(
              courseSession
                ? WEB_PATHS.SESSION_PARTICIPANTS_MANAGEMENT.replace(
                    ':id',
                    courseSession.id,
                  )
                : WEB_PATHS.SESSION_MANAGEMENT,
            )
          }
        >
          Cancel
        </Button>
        <Button
          size="medium"
          variant="primary"
          type="submit"
          avoidFullWidth
          className="h-11 w-29"
          isLoading={formik.isSubmitting}
          disabled={formik.isSubmitting}
        >
          Save
        </Button>
      </div>
      <InstructorOverlapModal
        {...{
          ...instructorOverlapModalProps,
          modalData: instructorOverlapModalData,
        }}
      />
    </form>
  );
};

export default SessionForm;
