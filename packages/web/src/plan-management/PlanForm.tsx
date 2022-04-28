import { useFormik } from 'formik';

import {
  ExternalPackageProviderType,
  InstancyPackageType,
  SubscriptionPlan,
  SubscriptionPlanCategory,
} from '../models/subscriptionPlan';
import Button from '../ui-kit/Button';
import planSchema from './plan.schema';
import CheckBox from '../ui-kit/CheckBox';
import { enumToArray } from '../utils/array';
import InputSelect from '../ui-kit/InputSelect';
import InputSection from '../ui-kit/InputSection';

const PlanForm = ({
  onSaveAction,
  plan,
  updatingPlan,
}: {
  onSaveAction: (args: any) => void;
  plan: SubscriptionPlan;
  updatingPlan: boolean;
}) => {
  const formik = useFormik({
    initialValues: {
      productId: plan.productId,
      name: plan.name,
      currency: plan.currency,
      price: plan.price,
      vatRate: plan.vatRate,
      category: plan.category,
      externalProviderType: plan.externalProviderType,
      durationValue: plan.durationValue,
      durationInterval: plan.durationInterval,
      periodDay: plan.periodDay,
      periodMonth: plan.periodMonth,
      periodYear: plan.periodYear,
      siteId: plan.siteId,
      siteUrl: plan.siteUrl,
      packageType: plan.packageType,
      memberType: plan.memberType,
      durationName: plan.durationName,
      membershipId: plan.membershipId,
      membershipDurationId: plan.membershipDurationId,
      isPublic: plan.isPublic,
      isActive: plan.isActive,
      isDefaultPackage: plan.isDefaultPackage,
    },
    enableReinitialize: true,
    validationSchema: planSchema,
    onSubmit: onSaveAction,
  });

  return (
    <form onSubmit={formik.handleSubmit} autoComplete="off" className="mb-8">
      <div className="mb-3">
        <InputSection
          formik={formik}
          name="productId"
          label="Product SKU *"
          disabled
          onBlur={formik.handleBlur}
          inputWrapperClassName="mb-3"
          value={formik.values.productId}
        />
        <InputSection
          formik={formik}
          name="name"
          label="Product Name *"
          disabled
          onBlur={formik.handleBlur}
          inputWrapperClassName="mb-3"
          value={formik.values.name}
        />
      </div>
      <div className="mb-3 flex w-full flex-row items-baseline justify-center">
        <InputSection
          formik={formik}
          name="currency"
          label="Currency *"
          disabled
          onBlur={formik.handleBlur}
          inputWrapperClassName="mr-1"
          value={formik.values.currency}
        />
        <InputSection
          formik={formik}
          name="price"
          label="Price *"
          disabled
          onBlur={formik.handleBlur}
          inputWrapperClassName="ml-1"
          value={formik.values.price}
        />
      </div>
      <div className="mb-3">
        <InputSection
          formik={formik}
          name="vatRate"
          label="VAT Rate *"
          onBlur={formik.handleBlur}
          value={formik.values.vatRate}
          onChange={formik.handleChange}
          error={formik.touched.vatRate && formik.errors.vatRate}
        />
      </div>
      <div className="mb-3 flex w-full flex-row items-baseline justify-center">
        <InputSelect
          name="category"
          label="Category *"
          formik={formik}
          options={enumToArray(SubscriptionPlanCategory)}
          value={{
            value: formik.values.category,
            label: formik.values.category,
          }}
          selectClassWrapperName="mr-1"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          error={formik.touched.category && formik.errors.category}
        />
        <InputSelect
          name="externalProviderType"
          label="External provider"
          formik={formik}
          options={enumToArray(ExternalPackageProviderType)}
          value={{
            value: formik.values.externalProviderType,
            label: formik.values.externalProviderType,
          }}
          selectClassWrapperName="ml-1"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          isClearable
        />
      </div>
      <div className="mb-3 flex w-full flex-row items-baseline justify-center">
        <InputSection
          formik={formik}
          name="durationInterval"
          label="Duration Interval (Deprecated)"
          disabled
          onBlur={formik.handleBlur}
          inputWrapperClassName="mr-1"
          value={formik.values.durationInterval}
        />
        <InputSection
          formik={formik}
          name="durationValue"
          label="Duration Value (Deprecated)"
          disabled
          onBlur={formik.handleBlur}
          inputWrapperClassName="ml-1"
          value={formik.values.durationValue}
        />
      </div>
      <div className="mb-3 flex w-full flex-row items-baseline justify-center space-x-2">
        <InputSection
          formik={formik}
          name="periodDay"
          label="Period Day *"
          disabled
          onBlur={formik.handleBlur}
          value={formik.values.periodDay}
        />
        <InputSection
          formik={formik}
          name="periodMonth"
          label="Period Month *"
          disabled
          onBlur={formik.handleBlur}
          value={formik.values.periodMonth}
        />
        <InputSection
          formik={formik}
          name="periodYear"
          label="Period Year *"
          disabled
          onBlur={formik.handleBlur}
          value={formik.values.periodYear}
        />
      </div>
      <div className="my-8">
        <p className="text-left text-subheading font-bold">
          Instancy related fields
        </p>
      </div>
      <div className="mb-3 flex w-full flex-row items-baseline justify-center">
        <InputSection
          formik={formik}
          name="siteId"
          label="Site ID"
          inputWrapperClassName="mr-1"
          onBlur={formik.handleBlur}
          value={formik.values.siteId}
          onChange={formik.handleChange}
        />
        <InputSection
          formik={formik}
          name="siteUrl"
          label="Site URL"
          inputWrapperClassName="ml-1"
          onBlur={formik.handleBlur}
          value={formik.values.siteUrl}
          onChange={formik.handleChange}
        />
      </div>
      <div className="mb-3">
        <InputSection
          name="externalProvider"
          label="Linked Organization"
          disabled
          value={plan?.externalProvider?.name || ''}
        />
      </div>
      <div className="mb-3">
        <InputSelect
          name="packageType"
          label="Package Type"
          formik={formik}
          options={enumToArray(InstancyPackageType)}
          value={{
            value: formik.values.packageType,
            label: formik.values.packageType,
          }}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          isClearable
        />
      </div>
      <div className="mb-3 flex w-full flex-row items-baseline justify-center">
        <InputSection
          formik={formik}
          name="memberType"
          label="Member Type"
          inputWrapperClassName="mr-1"
          onBlur={formik.handleBlur}
          value={formik.values.memberType}
          onChange={formik.handleChange}
        />
        <InputSection
          formik={formik}
          name="durationName"
          label="Duration Name"
          inputWrapperClassName="ml-1"
          onBlur={formik.handleBlur}
          value={formik.values.durationName}
          onChange={formik.handleChange}
        />
      </div>
      <div className="mb-3 flex w-full flex-row items-baseline justify-center">
        <InputSection
          formik={formik}
          name="membershipId"
          label="Membership ID"
          inputWrapperClassName="mr-1"
          onBlur={formik.handleBlur}
          value={formik.values.membershipId}
          onChange={formik.handleChange}
        />
        <InputSection
          formik={formik}
          name="membershipDurationId"
          label="Membership Duration ID"
          labelClassName="line-clamp-1 text-left"
          inputWrapperClassName="ml-1"
          onBlur={formik.handleBlur}
          value={formik.values.membershipDurationId}
          onChange={formik.handleChange}
        />
      </div>
      <div className="mb-3">
        <label className="flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 p-4 text-gray-500">
          <CheckBox
            type="round"
            disabled
            name="isDefaultPackage"
            value={undefined}
            checked={formik.values.isDefaultPackage}
          />
          <span>Is default package</span>
        </label>
      </div>

      <div className="mb-3 flex w-full flex-row items-baseline justify-center">
        <label className="mr-1 flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 p-4">
          <CheckBox
            type="round"
            name="isActive"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            inputClassName={'cursor-pointer'}
            value={undefined}
            checked={formik.values.isActive}
          />
          <span>Is Active</span>
        </label>
        <label className="ml-1 flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 p-4">
          <CheckBox
            type="round"
            name="isPublic"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            inputClassName={'cursor-pointer'}
            value={undefined}
            checked={formik.values.isPublic}
          />
          <span>Is Public</span>
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="medium"
        disabled={updatingPlan || !formik.isValid}
        isLoading={updatingPlan}
      >
        Update
      </Button>
    </form>
  );
};

export default PlanForm;
