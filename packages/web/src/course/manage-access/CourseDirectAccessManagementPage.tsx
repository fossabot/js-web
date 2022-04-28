import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaTrash, FaUpload } from 'react-icons/fa';
import { AccessControl } from '../../app-state/accessControl';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import useList from '../../hooks/useList';
import { centralHttp } from '../../http';
import { AdminLayout } from '../../layouts/admin.layout';
import { ICourseDirectAccess } from '../../models/courseDirectAccess';
import Button from '../../ui-kit/Button';
import ConfirmationModal from '../../ui-kit/ConfirmationModal';
import DropdownButton from '../../ui-kit/DropdownButton';
import ErrorMessages from '../../ui-kit/ErrorMessage';
import { useModal } from '../../ui-kit/HeadlessModal';
import { getErrorMessages } from '../../utils/error';
import AddCourseDirectAccessModal from './AddCourseDirectAccessModal';
import CourseDirectAccessManagementList from './CourseDirectAccessManagementList';

const CourseDirectAccessManagementListPage = () => {
  const router = useRouter();
  const { data, totalPages, fetchData } = useList<any>((options) => {
    return centralHttp.get(API_PATHS.COURSE_DIRECT_ACCESS, {
      params: options,
    });
  });

  const [currentEditableItem, setCurrentEditableItem] = useState(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectAll, setSelectAll] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  const deleteModalState = useModal();
  const createModalState = useModal();
  const updateModalState = useModal();

  useEffect(() => {
    if (isSelectAll) setSelectedItems([...data.map((item) => item.id)]);
    else setSelectedItems([]);
  }, [isSelectAll]);

  const handleError = (error) => {
    const msgs = getErrorMessages(error);
    setErrors(msgs);
  };

  const onClickSelect = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((id) => id !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const onConfirmDelete = async () => {
    try {
      setSubmitting(true);
      await centralHttp.delete(API_PATHS.COURSE_DIRECT_ACCESS, {
        data: { ids: selectedItems },
      });
      setSelectedItems([]);
      fetchData();
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  };

  const onCreateCourseDirectAccess = async (values: any) => {
    try {
      setErrors([]);
      await centralHttp.post(API_PATHS.COURSE_DIRECT_ACCESS, values);
      await fetchData();
    } catch (e) {
      handleError(e);
    }
  };

  const onUpdateCourseDirectAccess = async (values: any, id: string) => {
    try {
      setErrors([]);
      await centralHttp.put(
        API_PATHS.COURSE_DIRECT_ACCESS_DETAIL.replace(':id', id),
        values,
      );
      await fetchData();
    } catch (e) {
      handleError(e);
    }
  };

  const onEditAction = (item: ICourseDirectAccess) => {
    setCurrentEditableItem(item);
    updateModalState.toggle(true);
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
          <title>Course direct access management</title>
        </Head>
        <AddCourseDirectAccessModal
          {...{
            ...createModalState,
            currentEditableItem,
            headingText: 'Add direct access',
            onSubmit: onCreateCourseDirectAccess,
          }}
        />
        <AddCourseDirectAccessModal
          {...{
            ...updateModalState,
            currentEditableItem,
            onCloseUpdateModal: () => setCurrentEditableItem(null),
            headingText: 'Update direct access',
            onSubmit: onUpdateCourseDirectAccess,
          }}
        />
        <div className="mx-6 lg:mx-8">
          <ErrorMessages
            messages={errors}
            onClearAction={() => setErrors([])}
          />
          <div className="mb-2 flex flex-col items-center justify-between lg:flex-row">
            <div className="flex w-full lg:w-1/4">
              <h2 className="py-2 text-left font-bold text-black">
                Course direct accessors
              </h2>
            </div>
            <div className="mb-4 flex w-full flex-col items-center justify-end text-right lg:w-2/5 lg:flex-row">
              <div className="mx-1 w-full lg:w-1/2">
                <Button
                  size="medium"
                  type="submit"
                  variant="primary"
                  onClick={() => createModalState.toggle(true)}
                >
                  Create
                </Button>
              </div>
              <DropdownButton
                wrapperClassNames={'mx-1 mt-4 lg:mt-0 w-full lg:w-1/2'}
                buttonName={'Actions'}
                menuItems={[
                  {
                    name: 'Bulk upload access',
                    action: () =>
                      router.push(WEB_PATHS.COURSE_MANAGE_ACCESS_BULK_UPLOAD),
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
                    name: 'Delete access',
                    action: () => deleteModalState.toggle(true),
                    isDisabled: selectedItems.length < 1 || isSubmitting,
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
          <CourseDirectAccessManagementList
            onEditAction={onEditAction}
            courseDirectAccessList={data}
            totalPages={totalPages}
            onClickSelect={onClickSelect}
            isSelectAll={isSelectAll}
            setSelectAll={setSelectAll}
            selectedItems={selectedItems}
          />
        </div>
        <ConfirmationModal
          body={
            <p>Are you sure to permanently delete access for selected rows?</p>
          }
          header="Delete access"
          onOk={onConfirmDelete}
          isOpen={deleteModalState.isOpen}
          toggle={deleteModalState.toggle}
        />
      </AdminLayout>
    </AccessControl>
  );
};

export default CourseDirectAccessManagementListPage;
