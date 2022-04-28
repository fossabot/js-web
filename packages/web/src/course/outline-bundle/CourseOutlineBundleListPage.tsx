import Head from 'next/head';
import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';
import { useEffect, useState } from 'react';
import {
  FaCheck,
  FaEdit,
  FaPlus,
  FaTimes,
  FaTrash,
  FaTrashAlt,
  FaTrashRestore,
  FaTrashRestoreAlt,
} from 'react-icons/fa';
import { AccessControl } from '../../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import useList from '../../hooks/useList';
import CourseApi from '../../http/course.api';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import {
  ICourseOutlineBundle,
  PartialCourseOutlineBundle,
} from '../../models/course';
import { Language } from '../../models/language';
import Button from '../../ui-kit/Button';
import { useModal } from '../../ui-kit/HeadlessModal';
import { IListSearch } from '../../ui-kit/ListSearch';
import ThreePane from '../../ui-kit/three-pane-design/ThreePane';
import { getErrorMessages } from '../../utils/error';
import AddOutlineBundleModal from './AddOutlineBundleModal';
import AddOutlinesToBundleModal from './AddOutlinesToBundleModal';
import RemoveOutlineBundleModal from './RemoveOutlineBundleModal';
import RemoveOutlinesFromBundleModal from './RemoveOutlinesFromBundleModal';

type ICourseOutline = ICourseOutlineBundle<Language>['courseOutline'][0];

const fieldOptions: IListSearch['fieldOptions'] = [
  {
    label: 'Name',
    value: 'name',
  },
];

const sortOptions: IListSearch['sortOptions'] = [
  { label: 'Bundle name', value: 'name' },
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Updated Date', value: 'updatedAt' },
];

const CourseOutlineBundleListPage = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const id = router.query.id as string | undefined;

  const { data, totalPages, fetchData } = useList<PartialCourseOutlineBundle>(
    (options) => CourseApi.getCourseOutlineBundles(options),
  );

  const [currentBundle, setCurrentBundle] =
    useState<ICourseOutlineBundle<Language> | null>(null);
  const [checkedRows, setCheckedRows] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>();

  const { isOpen: isAddModalOpen, toggle: toggleAddModal } = useModal();
  const { isOpen: isUpdateBundleOpen, toggle: toggleUpdateBundleModal } =
    useModal();
  const { isOpen: isDeleteBundleOpen, toggle: toggleDeleteBundleModal } =
    useModal();
  const { isOpen: isDeleteOutlineOpen, toggle: toggleDeleteOutlineModal } =
    useModal();
  const { isOpen: isAddOutlinesModalOpen, toggle: toggleAddOutlinesModal } =
    useModal();

  const handleError = (error) => {
    const msgs = getErrorMessages(error);
    setErrors(msgs);
  };

  const fetchBundleDetail = async (id: string) => {
    try {
      const outlineBundleDetail = await CourseApi.getCourseOutlineBundleById(
        id,
      );
      setCurrentBundle(outlineBundleDetail);
    } catch (e) {
      handleError(e);
      console.error();
    }
  };

  useEffect(() => {
    if (id) {
      const newQuery = router.query;
      delete newQuery.id;

      router.replace(stringifyUrl({ url: router.pathname, query: newQuery }));
      fetchBundleDetail(id);
    }
  }, [id]);

  const onCreateBundle = async (name: string) => {
    try {
      const res = await CourseApi.createCourseOutlineBundle(name);
      await Promise.all([fetchData(), fetchBundleDetail(res.id)]);
    } catch (e) {
      handleError(e);
      console.error();
    }
  };

  const onUpdateBundle = async (name: string, isActive?: boolean) => {
    try {
      const response = await CourseApi.updateCourseOutlineBundle(
        currentBundle.id,
        name,
        currentBundle.courseOutline.map((co) => co.id),
        isActive,
      );
      await Promise.all([fetchData(), fetchBundleDetail(response.id)]);
    } catch (e) {
      handleError(e);
      console.error();
    }
  };

  const onAddOutlinesToBundle = async (outlineIds: string[]) => {
    try {
      const response = await CourseApi.updateCourseOutlineBundle(
        currentBundle.id,
        currentBundle.name,
        [...outlineIds, ...currentBundle.courseOutline.map((co) => co.id)],
      );
      await Promise.all([fetchData(), fetchBundleDetail(response.id)]);
    } catch (e) {
      handleError(e);
      console.error();
    }
  };

  const onConfirmDeleteOutlines = async () => {
    try {
      const response = await CourseApi.updateCourseOutlineBundle(
        currentBundle.id,
        currentBundle.name,
        currentBundle.courseOutline
          .filter((co) => !checkedRows.includes(co.id))
          .map((cof) => cof.id),
      );
      await Promise.all([fetchData(), fetchBundleDetail(response.id)]);
      setCheckedRows([]);
    } catch (e) {
      handleError(e);
      console.error();
    } finally {
      toggleDeleteOutlineModal(false);
    }
  };

  const onConfirmDeleteBundle = async () => {
    try {
      await CourseApi.deleteCourseOutlineBundleById(currentBundle.id);
      setCurrentBundle(null);
      await fetchData();
    } catch (e) {
      handleError(e);
      console.error();
    } finally {
      toggleDeleteBundleModal(false);
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
          <title>
            {t('headerText')} | {t('courseOutlineBundlePage.title')}
          </title>
        </Head>
        <AddOutlineBundleModal
          isOpen={isAddModalOpen}
          toggle={toggleAddModal}
          onSubmit={onCreateBundle}
          headingText={t('courseOutlineBundlePage.createBundleModal')}
        />
        <AddOutlineBundleModal
          isOpen={isUpdateBundleOpen}
          toggle={toggleUpdateBundleModal}
          onSubmit={onUpdateBundle}
          defaultName={currentBundle && currentBundle.name}
          headingText={t('courseOutlineBundlePage.updateBundleModal')}
        />
        <AddOutlinesToBundleModal
          isOpen={isAddOutlinesModalOpen}
          toggle={toggleAddOutlinesModal}
          onSubmit={onAddOutlinesToBundle}
          headingText={t('courseOutlineBundlePage.addOutlinesModal')}
        />
        <RemoveOutlineBundleModal
          isOpen={isDeleteBundleOpen}
          toggle={toggleDeleteBundleModal}
          onConfirm={onConfirmDeleteBundle}
          name={currentBundle ? currentBundle.name : ''}
        />
        <RemoveOutlinesFromBundleModal
          isOpen={isDeleteOutlineOpen}
          toggle={toggleDeleteOutlineModal}
          onConfirm={onConfirmDeleteOutlines}
          name={currentBundle ? currentBundle.name : ''}
          checkedRows={checkedRows}
        />
        <ThreePane<
          PartialCourseOutlineBundle,
          ICourseOutlineBundle<Language>,
          ICourseOutline
        >
          topPane={{
            errors,
            setErrors,
            fieldOptions,
            sortOptions,
            headingText: currentBundle ? (
              <div className="flex flex-row items-center">
                {t('courseOutlineBundlePage.title')} - {currentBundle.name}(
                <>
                  {currentBundle?.isActive ? (
                    <FaCheck
                      className="h-5 w-5 text-green-200"
                      aria-hidden="true"
                    />
                  ) : (
                    <FaTimes
                      className="h-5 w-5 text-red-200"
                      aria-hidden="true"
                    />
                  )}
                </>
                )
              </div>
            ) : (
              t('courseOutlineBundlePage.title')
            ),
            menuItems: [
              {
                name: currentBundle?.isActive
                  ? t('courseOutlineBundlePage.deactivateBundle')
                  : t('courseOutlineBundlePage.activateBundle'),
                isDisabled: !currentBundle,
                action: () =>
                  onUpdateBundle(currentBundle.name, !currentBundle.isActive),
                activeIcon: (
                  <>
                    {currentBundle?.isActive ? (
                      <FaTimes
                        className="mr-2 h-5 w-5 text-red-300"
                        aria-hidden="true"
                      />
                    ) : (
                      <FaCheck
                        className="mr-2 h-5 w-5 text-green-300"
                        aria-hidden="true"
                      />
                    )}
                  </>
                ),
                inactiveIcon: (
                  <>
                    {currentBundle?.isActive ? (
                      <FaTimes
                        className="mr-2 h-5 w-5 text-red-200"
                        aria-hidden="true"
                      />
                    ) : (
                      <FaCheck
                        className="mr-2 h-5 w-5 text-green-200"
                        aria-hidden="true"
                      />
                    )}
                  </>
                ),
              },
              {
                name: t('courseOutlineBundlePage.addOutlinesModal'),
                isDisabled: !currentBundle,
                action: () => toggleAddOutlinesModal(true),
                activeIcon: (
                  <FaPlus
                    className="mr-2 h-5 w-5 text-green-300"
                    aria-hidden="true"
                  />
                ),
                inactiveIcon: (
                  <FaPlus
                    className="mr-2 h-5 w-5 text-green-200"
                    aria-hidden="true"
                  />
                ),
              },
              {
                name: t('courseOutlineBundlePage.removeOutlines'),
                isDisabled: checkedRows.length === 0,
                action: () => toggleDeleteOutlineModal(true),
                activeIcon: (
                  <FaTrash
                    className="mr-2 h-5 w-5 text-red-200"
                    aria-hidden="true"
                  />
                ),
                inactiveIcon: (
                  <FaTrashRestore
                    className="mr-2 h-5 w-5 text-red-200"
                    aria-hidden="true"
                  />
                ),
              },
              {
                name: t('courseOutlineBundlePage.editBundle'),
                isDisabled: !currentBundle,
                action: () => toggleUpdateBundleModal(true),
                activeIcon: (
                  <FaEdit
                    className="mr-2 h-5 w-5 text-gray-600"
                    aria-hidden="true"
                  />
                ),
                inactiveIcon: (
                  <FaEdit
                    className="mr-2 h-5 w-5 text-gray-500"
                    aria-hidden="true"
                  />
                ),
              },
              {
                name: t('courseOutlineBundlePage.removeBundle'),
                isDisabled: !currentBundle,
                action: () => toggleDeleteBundleModal(true),
                activeIcon: (
                  <FaTrashAlt
                    className="mr-2 h-5 w-5 text-red-200"
                    aria-hidden="true"
                  />
                ),
                inactiveIcon: (
                  <FaTrashRestoreAlt
                    className="mr-2 h-5 w-5 text-red-200"
                    aria-hidden="true"
                  />
                ),
              },
            ],
          }}
          leftPane={{
            onClickAdd: toggleAddModal,
            addButtonLabel: t('courseOutlineBundlePage.addBundle'),
            data,
            current: currentBundle,
            render(bundle) {
              return (
                <div className="flex flex-row items-center">
                  {bundle.name}(
                  <>
                    {bundle.isActive ? (
                      <FaCheck
                        className="h-5 w-5 text-green-200"
                        aria-hidden="true"
                      />
                    ) : (
                      <FaTimes
                        className="h-5 w-5 text-red-200"
                        aria-hidden="true"
                      />
                    )}
                  </>
                  )
                </div>
              );
            },
            emptyLabel: t('courseOutlineBundlePage.noBundle'),
            fetchDetail: fetchBundleDetail,
            totalPages,
          }}
          rightPane={{
            emptyText: t('courseOutlineBundlePage.noOutline'),
            list: currentBundle ? currentBundle.courseOutline : [],
            checkedRows,
            setCheckedRows,
            columns: [
              {
                label: 'COURSECODE',
                dataKey: 'courseCode',
                width: 300,
              },
              {
                label: 'TITLE',
                dataKey: 'title',
                width: 600,
                disableSort: true,
              },
              {
                dataKey: 'courseId',
                cellRenderer({ cellData: courseId }) {
                  return (
                    <Button
                      variant="primary"
                      size="medium"
                      onClick={() =>
                        router.push(
                          WEB_PATHS.ADMIN_COURSE_DETAIL.replace(
                            ':id',
                            courseId,
                          ),
                        )
                      }
                    >
                      {t('courseOutlineBundlePage.detail')}
                    </Button>
                  );
                },
                width: 100,
              },
            ],
          }}
        />
      </AdminLayout>
    </AccessControl>
  );
};

export default CourseOutlineBundleListPage;
