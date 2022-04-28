import { format } from 'date-fns';
import { FC, useRef, memo } from 'react';
import { Dialog } from '@headlessui/react';

import Button from '../../ui-kit/Button';
import { FaceToFace, Virtual } from '../../ui-kit/icons';
import { Modal } from '../../ui-kit/HeadlessModal';
import { ProfilePic } from '../../ui-kit/ProfilePic';
import { useLocaleText } from '../../i18n/useLocaleText';
import { CourseSubCategoryKey } from '../../models/course';

interface IInstructorOverlapModal {
  isOpen: boolean;
  toggle: () => void;
  modalData?: any;
}

const InstructorOverlapModal: FC<IInstructorOverlapModal> = (props) => {
  const { isOpen, toggle, modalData } = props;

  const initialFocusRef = useRef(null);
  const localeText = useLocaleText();

  if (!modalData) return null;
  const { courseSession, instructor } = modalData;

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      skipFullWidth
      className="w-472px p-8"
      initialFocusRef={initialFocusRef}
    >
      <Dialog.Title as="div" className="">
        <h6 className="mb-4 text-subheading font-semibold">
          Instructor is overlapping.
        </h6>
        <p className="mb-6 text-body text-gray-650">
          The instructor cannot be selected due to the overlapping date and time
          with the following session.
        </p>
      </Dialog.Title>

      <div className="mb-8 rounded-2xl border border-gray-200 bg-gray-100 p-6">
        <p className="mb-3 border-b border-gray-200 pb-3 text-caption font-semibold line-clamp-2">
          {localeText(courseSession.courseOutline.title)}
        </p>
        <div className="flex flex-row items-center justify-between space-x-2">
          <div className="flex flex-row space-x-2">
            <ProfilePic
              className="h-9 w-9 text-gray-300"
              imageKey={instructor.imageKey}
            />
            <div className="flex flex-col">
              <span className="text-caption font-semibold">
                {instructor.fullName}
              </span>
              <div className="mt-1 flex flex-row items-center">
                {courseSession.courseOutline.category.key ===
                CourseSubCategoryKey.FACE_TO_FACE ? (
                  <FaceToFace className="mr-1 h-3.5 w-3.5" />
                ) : (
                  <Virtual className="mr-1 h-3.5 w-3.5" />
                )}
                <span className="text-footnote font-semibold text-gray-500">
                  {courseSession.courseOutline.category.key ===
                  CourseSubCategoryKey.FACE_TO_FACE
                    ? 'Face-to-Face'
                    : 'Virtual'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-caption font-semibold">
              <span>
                {format(new Date(courseSession.startDateTime), 'EEEE')} -{' '}
              </span>
              <span className="uppercase">
                {format(new Date(courseSession.endDateTime), 'd MMM yy')}
              </span>
            </span>
            <span className="self-end text-caption font-semibold text-gray-500">
              {format(new Date(courseSession.startDateTime), 'hh:mm')}-{' '}
              {format(new Date(courseSession.endDateTime), 'hh:mm')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          ref={initialFocusRef}
          avoidFullWidth
          className="font-semibold"
          size="medium"
          variant="primary"
          type="button"
          onClick={() => {
            toggle();
          }}
        >
          Select another instructor
        </Button>
      </div>
    </Modal>
  );
};

export default memo(
  InstructorOverlapModal,
  (prev, next) => prev.isOpen === next.isOpen,
);
