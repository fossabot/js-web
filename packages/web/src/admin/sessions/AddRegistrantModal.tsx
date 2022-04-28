import { Dispatch, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import useTranslation from '../../i18n/useTranslation';
import { Modal } from '../../ui-kit/HeadlessModal';
import { Dialog } from '@headlessui/react';
import Button from '../../ui-kit/Button';
import { CourseSessionOverview } from '../../models/course-session';
import Picture from '../../ui-kit/Picture';
import InputSelect from '../../ui-kit/InputSelect';
import useMultiAsyncInput from '../../hooks/useMultiAsyncInput';
import { centralHttp } from '../../http';
import API_PATHS from '../../constants/apiPaths';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Person, Search } from '../../ui-kit/icons';
import { captureError } from '../../utils/error-routing';
import CourseSessionApi from '../../http/course-session.api';
import { ERROR_CODES } from '../../constants/errors';
import { format } from 'date-fns';

type SearchResult = { id: string; email: string };

interface IAddRegistrantModal {
  isOpen: boolean;
  toggle: Dispatch<boolean>;
  session: CourseSessionOverview;
  onAddRegistrantsCompleted: () => void;
  onAvailableSeatConflict: () => Promise<void>;
}

function AddRegistrantModal({
  isOpen,
  toggle,
  session,
  onAddRegistrantsCompleted,
  onAvailableSeatConflict,
}: IAddRegistrantModal) {
  const { t } = useTranslation();
  const [isAddingRegistrants, setIsAddingRegistrants] = useState(false);
  const containerRef = useRef(null);
  const formik = useFormik({
    initialValues: {
      studentIds: [],
    },
    validationSchema: Yup.object({
      studentIds: Yup.array()
        .of(Yup.string())
        .min(
          1,
          'sessionParticipantManagementPage.addRegistrantModal.selectAtleastOneUser',
        )
        .required(
          'sessionParticipantManagementPage.addRegistrantModal.selectAtleastOneUser',
        )
        .test(
          'sessionSeatExceedLimit',
          'sessionParticipantManagementPage.addRegistrantModal.seatExceedLimit',
          (ids) => {
            const { seats, booked } = session;
            const sum = booked + ids.length;
            return sum <= seats;
          },
        ),
    }),
    validateOnBlur: false,
    onSubmit: handleSubmit,
  });

  const {
    options: studentOptions,
    getOptions: getStudentOptions,
    inputValues: studentInputValues,
    onValueChange: onStudentValueChange,
  } = useMultiAsyncInput({
    http: centralHttp.get,
    apiPath: API_PATHS.COURSE_SESSIONS_BOOKABLE_USERS.replace(
      ':id',
      session.id,
    ),
    fieldName: 'email',
    formikFieldValue: formik.values.studentIds,
  });

  function closeModal() {
    formik.resetForm();
    toggle(false);
  }

  function handleSplitValue(options: SearchResult[], value: string) {
    const id = options.find((o) => o.email === value)?.id;
    if (id) {
      const studentIds = [...formik.values.studentIds, id];
      formik.setValues({
        studentIds,
      });
    }
  }

  async function handleEnterMultiValues(options: SearchResult[]) {
    const studentIds = [
      ...formik.values.studentIds,
      ...options
        .filter((o) => !formik.values.studentIds.includes(o.id))
        .map((o) => o.id),
    ];
    formik.setValues({
      studentIds,
    });
  }

  async function handleSubmit() {
    try {
      setIsAddingRegistrants(true);
      await CourseSessionApi.addRegistrants(
        session.id,
        formik.values.studentIds,
      );
      onAddRegistrantsCompleted();
      closeModal();
    } catch (error) {
      if (
        error?.response?.data?.code ===
        ERROR_CODES.SESSION_ADD_REGISTRANTS_EXCEED_SEATS_LIMIT.code
      ) {
        await onAvailableSeatConflict();
        formik.validateForm();
      } else {
        captureError(error);
      }
    } finally {
      setIsAddingRegistrants(false);
    }
  }

  const sessionDate = useMemo(
    () =>
      format(new Date(session.startDateTime), 'eee - d MMM yy').toUpperCase(),
    [session.startDateTime],
  );
  const sessionStartTime = useMemo(
    () => format(new Date(session.startDateTime), 'HH:mm'),
    [session.startDateTime],
  );
  const sessionEndTime = useMemo(
    () => format(new Date(session.endDateTime), 'HH:mm'),
    [session.endDateTime],
  );

  const sum = useMemo(
    () => formik.values.studentIds.length + session.booked,
    [session.booked, formik.values.studentIds.length],
  );

  const NoOptionsMessage = () => {
    return (
      <div className="flex items-center p-4 text-gray-500">
        <Search className="h-5 w-5" />
        <p className="ml-4 font-semibold">
          {t(
            'sessionParticipantManagementPage.addRegistrantModal.result_not_found',
          )}
        </p>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      skipFullWidth
      initialFocusRef={containerRef}
      className="box-content w-140 p-5 lg:p-8"
    >
      <Dialog.Title as="div" className="flex justify-between">
        <span className="text-subheading font-semibold text-black">
          {t('sessionParticipantManagementPage.addRegistrant')}
        </span>
      </Dialog.Title>

      <div className="my-3" ref={containerRef}>
        <InputSelect
          formik={formik}
          name="studentIds"
          value={studentInputValues}
          isAsync={true}
          isMulti={true}
          isSearchable={true}
          promiseOptions={getStudentOptions}
          options={studentOptions}
          placeholder={t(
            'sessionParticipantManagementPage.addRegistrantModal.emailAddress',
          )}
          onBlur={formik.handleBlur}
          selectClassWrapperName="my-4"
          onChange={(e) => {
            onStudentValueChange(e.target.value);
            formik.handleChange(e);
          }}
          overrideStyles={{
            control: (base) => ({
              ...base,
              height: 86,
              alignItems: 'flex-start',
              overflowY: 'scroll',
            }),
            placeholder: (base) => ({
              ...base,
              top: 20,
            }),
            indicatorsContainer: (base) => ({
              ...base,
              display: 'none',
            }),
          }}
          onSplitValue={handleSplitValue}
          onEnterMultiValues={handleEnterMultiValues}
          maxMenuHeight={130}
          components={{
            NoOptionsMessage,
          }}
        />
      </div>
      <div className="-mt-2 flex items-center justify-between text-footnote font-semibold text-red-200">
        <div>
          {formik.touched.studentIds &&
            formik.errors.studentIds?.length &&
            t(formik.errors.studentIds as string)}
        </div>
        <div
          className={cx('flex', {
            'text-red-200': sum > session.seats,
            'text-gray-650': sum <= session.seats,
          })}
        >
          <Person className="mr-1 h-4 w-4" />
          <div>
            {sum}/{session.seats}
          </div>
        </div>
      </div>

      <div className="mt-3 mb-6 flex space-x-2 overflow-hidden rounded-lg bg-gray-100 p-4">
        <div className="h-46px w-46px">
          {!session.courseImageKey ? (
            <Picture
              className="h-full w-full rounded-lg object-cover object-center"
              sources={[
                {
                  srcSet: '/assets/course/course-default.webp',
                  type: 'image/webp',
                },
              ]}
              fallbackImage={{ src: '/assets/course/course-default.png' }}
            />
          ) : (
            <img
              src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${session.courseImageKey}`}
              className="h-full w-full rounded-lg object-cover object-center"
            />
          )}
        </div>
        <div className="flex-1">
          <div
            className="text-caption font-semibold text-black line-clamp-1"
            title={session.courseTitle}
          >
            {session.courseTitle}
          </div>
          <div
            className="mt-1 text-footnote font-semibold text-gray-500 line-clamp-1"
            title={session.instructorName}
          >
            {session.instructorName}
          </div>
        </div>
        <div className="w-36 text-right">
          <div
            className="text-caption font-semibold text-black"
            title={sessionDate}
          >
            {sessionDate}
          </div>
          <div className="mt-1 text-caption font-semibold text-gray-500">{`${sessionStartTime} - ${sessionEndTime}`}</div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          avoidFullWidth
          className="order-1 ml-4 font-semibold"
          size="medium"
          variant="primary"
          type="button"
          onClick={() => formik.submitForm()}
          isLoading={isAddingRegistrants}
          disabled={isAddingRegistrants}
        >
          {t('sessionParticipantManagementPage.addRegistrant')}
        </Button>
        <Button
          avoidFullWidth
          className="order-0 font-semibold"
          size="medium"
          variant="secondary"
          type="button"
          onClick={() => closeModal()}
        >
          {t('sessionParticipantManagementPage.cancel')}
        </Button>
      </div>
    </Modal>
  );
}

export default AddRegistrantModal;
