import { uniq } from 'lodash';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';
import { useCallback, useMemo, useState } from 'react';
import { FaPlus, FaTrash, FaTrashRestore } from 'react-icons/fa';
import { AccessControl } from '../../app-state/accessControl';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import useList from '../../hooks/useList';
import { paymentHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import { PartialCourseOutlineBundle } from '../../models/course';
import { SubscriptionPlan } from '../../models/subscriptionPlan';
import Button from '../../ui-kit/Button';
import { IListSearch } from '../../ui-kit/ListSearch';
import { useModal } from '../../ui-kit/Modal';
import ThreePane from '../../ui-kit/three-pane-design/ThreePane';
import { IThreePaneLeftPane } from '../../ui-kit/three-pane-design/ThreePaneLeftPane';
import { IThreePaneRightPane } from '../../ui-kit/three-pane-design/ThreePaneRightPane';
import { IThreePaneTopPane } from '../../ui-kit/three-pane-design/ThreePaneTopPane';
import { getErrorMessages } from '../../utils/error';
import { AddBundlesToPlanModal } from './AddBundlesToPlanModal';
import RemoveBundlesFromPlanModal from './RemoveBundlesFromPlanModal';

const fieldOptions: IListSearch['fieldOptions'] = [
  {
    label: 'Product name',
    value: 'name',
  },
  {
    label: 'Product ID',
    value: 'productId',
  },
];

const sortOptions: IListSearch['sortOptions'] = [
  { label: 'Product name', value: 'name' },
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Updated Date', value: 'updatedAt' },
];

export const PlanCourseBundleListPage = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const { data, totalPages } = useList<SubscriptionPlan>((params) =>
    paymentHttp.get(API_PATHS.ALL_PLANS, { params }),
  );

  const [errors, setErrors] = useState<string[]>();
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);

  const [checkedRows, setCheckedRows] = useState<SubscriptionPlan['id'][]>([]);

  const addBundlesModal = useModal();
  const removeBundlesModal = useModal();

  const handleError = (error) => {
    const msgs = getErrorMessages(error);
    setErrors(msgs);
  };

  const fetchSubscriptionPlanDetail = useCallback(
    async (id: SubscriptionPlan['id']) => {
      try {
        setCheckedRows([]);
        const res = await paymentHttp.get<BaseResponseDto<SubscriptionPlan>>(
          API_PATHS.PLAN_DETAIL_ALL.replace(':planId', id),
          { params: { withCourseBundles: true } },
        );
        setCurrentPlan(res.data.data);
      } catch (err) {
        handleError(err);
        console.error(err);
      }
    },
    [],
  );

  const topPaneProps = useMemo<IThreePaneTopPane>(() => {
    return {
      sortOptions,
      fieldOptions,
      errors,
      setErrors,
      headingText: currentPlan
        ? `${t('planCourseBundlePage.title')} - ${currentPlan.name}`
        : t('planCourseBundlePage.title'),
      menuItems: [
        {
          name: t('planCourseBundlePage.addBundles'),
          isDisabled: !currentPlan,
          action: () => addBundlesModal.toggle(),
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
          name: t('planCourseBundlePage.removeBundles'),
          isDisabled: checkedRows.length === 0,
          action: () => removeBundlesModal.toggle(),
          activeIcon: (
            <FaTrash className="mr-2 h-5 w-5 text-red-200" aria-hidden="true" />
          ),
          inactiveIcon: (
            <FaTrashRestore
              className="mr-2 h-5 w-5 text-red-200"
              aria-hidden="true"
            />
          ),
        },
      ],
    };
  }, [
    errors,
    currentPlan,
    checkedRows,
    addBundlesModal.toggle,
    removeBundlesModal.toggle,
  ]);

  const leftPaneProps = useMemo<
    IThreePaneLeftPane<SubscriptionPlan, SubscriptionPlan>
  >(() => {
    return {
      data,
      current: currentPlan,
      render: (plan) => plan.name,
      emptyLabel: t('planCourseBundlePage.noPlans'),
      totalPages,
      fetchDetail: fetchSubscriptionPlanDetail,
    };
  }, [currentPlan, data, totalPages, fetchSubscriptionPlanDetail]);

  const rightPaneProps = useMemo<
    IThreePaneRightPane<PartialCourseOutlineBundle>
  >(() => {
    return {
      list: currentPlan ? currentPlan.courseOutlineBundle || [] : [],
      checkedRows,
      setCheckedRows,
      emptyText: t('planCourseBundlePage.noBundles'),
      columns: [
        {
          label: 'Bundle',
          dataKey: 'name',
          width: 600,
        },
        {
          label: 'Action',
          dataKey: 'name',
          cellRenderer({ rowData }) {
            return (
              <Button
                variant="primary"
                size="medium"
                onClick={() =>
                  router.push(
                    stringifyUrl({
                      url: WEB_PATHS.COURSE_OUTLINE_BUNDLE,
                      query: {
                        id: rowData.id,
                      },
                    }),
                  )
                }
              >
                {t('planCourseBundlePage.detail')}
              </Button>
            );
          },
          width: 100,
        },
      ],
    };
  }, [checkedRows, currentPlan]);

  const getBasePlanUpdateBody = (plan: SubscriptionPlan) => {
    return {
      vatRate: plan.vatRate,
      category: plan.category,
      externalProviderType: plan.externalProviderType,
      isPublic: plan.isPublic,
      isActive: plan.isActive,
      siteUrl: plan.siteUrl,
      siteId: plan.siteId,
      packageType: plan.packageType,
      memberType: plan.memberType,
      durationName: plan.durationName,
      membershipId: plan.membershipId,
      membershipDurationId: plan.membershipDurationId,
    };
  };

  const onAddBundlesToPlan = async (
    bundleIds: PartialCourseOutlineBundle['id'][],
  ) => {
    if (!currentPlan) return;

    try {
      const body = {
        ...getBasePlanUpdateBody(currentPlan),
        courseBundleIds: uniq([
          ...bundleIds,
          ...currentPlan.courseOutlineBundle.map((bundle) => bundle.id),
        ]),
      };

      await paymentHttp.put(
        API_PATHS.PLAN_DETAIL.replace(':planId', currentPlan.id),
        body,
      );

      await fetchSubscriptionPlanDetail(currentPlan.id);
      addBundlesModal.toggle();
    } catch (err) {
      handleError(err);
      console.error(err);
    }
  };

  const onRemoveBundlesFromPlan = async () => {
    if (!currentPlan) return;
    try {
      const body = {
        ...getBasePlanUpdateBody(currentPlan),
        courseBundleIds: currentPlan.courseOutlineBundle
          .map((bundle) => bundle.id)
          .filter((id) => !checkedRows.includes(id)),
      };

      await paymentHttp.put(
        API_PATHS.PLAN_DETAIL.replace(':planId', currentPlan.id),
        body,
      );

      await fetchSubscriptionPlanDetail(currentPlan.id);
      removeBundlesModal.toggle();
    } catch (err) {
      handleError(err);
      console.error(err);
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
            {t('headerText')} | {t('planCourseBundlePage.title')}
          </title>
        </Head>
        <ThreePane
          topPane={topPaneProps}
          leftPane={leftPaneProps}
          rightPane={rightPaneProps}
        />
      </AdminLayout>
      <AddBundlesToPlanModal
        {...{
          ...addBundlesModal,
          headingText: `${t('planCourseBundlePage.addBundleHeader')} ${
            currentPlan?.name
          }`,
          onSubmit: onAddBundlesToPlan,
        }}
      />
      <RemoveBundlesFromPlanModal
        {...{
          ...removeBundlesModal,
          headerText: `${t('planCourseBundlePage.removeBundleHeader')} ${
            currentPlan?.name
          }`,
          onConfirm: onRemoveBundlesFromPlan,
        }}
      />
    </AccessControl>
  );
};
