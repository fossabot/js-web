import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaPaperclip, FaPersonBooth, FaTrash, FaUpload } from 'react-icons/fa';
import { AccessControl } from '../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import WEB_PATHS from '../constants/webPaths';
import useList from '../hooks/useList';
import CourseApi from '../http/course.api';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import Button from '../ui-kit/Button';
import ConfirmationModal from '../ui-kit/ConfirmationModal';
import DropdownButton from '../ui-kit/DropdownButton';
import { FileDuplicate } from '../ui-kit/icons';
import { useModal } from '../ui-kit/Modal';
import CourseList from './CourseList';

const CourseListPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const courseApi = CourseApi;
  const { data, totalPages, fetchData } = useList<any>((options) => {
    return courseApi.getCourses(options);
  });
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [isSelectAll, setSelectAll] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const deleteModalState = useModal();

  useEffect(() => {
    if (isSelectAll) setSelectedCourses([...data.map((item) => item.id)]);
    else setSelectedCourses([]);
  }, [isSelectAll]);

  const routeToCreate = () => {
    router.push(WEB_PATHS.COURSE_CREATE);
  };

  const onClickSelect = (id: string) => {
    if (selectedCourses.includes(id)) {
      setSelectedCourses(selectedCourses.filter((id) => id !== id));
    } else {
      setSelectedCourses([...selectedCourses, id]);
    }
  };

  const onClickDelete = () => {
    deleteModalState.toggle();
  };

  const onConfirmDelete = async () => {
    try {
      setSubmitting(true);
      await courseApi.deleteCourses(selectedCourses);
      setSelectedCourses([]);
      fetchData();
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('courseListPage.title')}</title>
        </Head>
        <div className="mx-6 lg:mx-8">
          <div className="mb-2 flex flex-col items-center justify-between lg:flex-row">
            <div className="flex w-full lg:w-1/4">
              <h2 className="py-2 text-left font-bold text-black">Courses</h2>
            </div>
            <div className="mb-4 flex w-full flex-col items-center justify-end text-right lg:w-2/5 lg:flex-row">
              <div className="mx-1 w-full lg:w-1/2">
                <Button
                  size="medium"
                  type="submit"
                  variant="primary"
                  onClick={routeToCreate}
                >
                  Create
                </Button>
              </div>
              <DropdownButton
                wrapperClassNames={'mx-1 mt-4 lg:mt-0 w-full lg:w-1/2'}
                buttonName={'Actions'}
                menuItems={[
                  {
                    name: 'Manage rules',
                    action: () => router.push(WEB_PATHS.COURSE_RULE),
                    isDisabled: isSubmitting,
                    activeIcon: (
                      <FaPaperclip
                        className="mr-2 h-5 w-5 text-yellow-200"
                        aria-hidden="true"
                      />
                    ),
                    inactiveIcon: (
                      <FaPaperclip
                        className="mr-2 h-5 w-5 text-yellow-200"
                        aria-hidden="true"
                      />
                    ),
                  },
                  {
                    name: 'Bundle outlines',
                    action: () => router.push(WEB_PATHS.COURSE_OUTLINE_BUNDLE),
                    isDisabled: isSubmitting,
                    activeIcon: (
                      <FileDuplicate
                        className="mr-2 h-5 w-5 text-green-200"
                        aria-hidden="true"
                      />
                    ),
                    inactiveIcon: (
                      <FileDuplicate
                        className="mr-2 h-5 w-5 text-green-200"
                        aria-hidden="true"
                      />
                    ),
                  },
                  {
                    name: 'Manage course access',
                    action: () => router.push(WEB_PATHS.COURSE_MANAGE_ACCESS),
                    isDisabled: isSubmitting,
                    activeIcon: (
                      <FaPersonBooth
                        className="mr-2 h-5 w-5 text-yellow-200"
                        aria-hidden="true"
                      />
                    ),
                    inactiveIcon: (
                      <FaPersonBooth
                        className="mr-2 h-5 w-5 text-yellow-200"
                        aria-hidden="true"
                      />
                    ),
                  },
                  {
                    name: 'Bulk upload sessions',
                    action: () =>
                      router.push(WEB_PATHS.SESSION_MANAGEMENT_BULK_UPLOAD),
                    isDisabled: isSubmitting,
                    activeIcon: (
                      <FaUpload
                        className="mr-2 h-5 w-5 text-green-200"
                        aria-hidden="true"
                      />
                    ),
                    inactiveIcon: (
                      <FaUpload
                        className="mr-2 h-5 w-5 text-green-200"
                        aria-hidden="true"
                      />
                    ),
                  },
                  {
                    name: 'Delete Course',
                    action: onClickDelete,
                    isDisabled: selectedCourses.length < 1 || isSubmitting,
                    activeIcon: (
                      <FaTrash
                        className="mr-2 h-5 w-5 text-red-200"
                        aria-hidden="true"
                      />
                    ),
                    inactiveIcon: (
                      <FaTrash
                        className="mr-2 h-5 w-5 text-red-200"
                        aria-hidden="true"
                      />
                    ),
                  },
                ]}
              />
            </div>
          </div>
          <CourseList
            courses={data}
            totalPages={totalPages}
            onClickSelect={onClickSelect}
            isSelectAll={isSelectAll}
            setSelectAll={setSelectAll}
            selectedCourses={selectedCourses}
          />
        </div>
        <ConfirmationModal
          body={<p>Are you sure to permanently delete selected courses?</p>}
          header="Delete course"
          onOk={onConfirmDelete}
          isOpen={deleteModalState.isOpen}
          toggle={deleteModalState.toggle}
        />
      </AdminLayout>
    </AccessControl>
  );
};

export default CourseListPage;
