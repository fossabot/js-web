import { useMemo } from 'react';
import { useFormik } from 'formik';

import InputSelect from '../ui-kit/InputSelect';

const LinkPlanToOrganization = ({
  plans,
  onAddAction,
}: {
  plans?: any;
  onAddAction: (value: any) => Promise<void>;
}) => {
  const formik = useFormik({
    initialValues: {
      plan: '',
    },
    enableReinitialize: true,
    onSubmit: handleFormSubmit,
  });

  async function handleFormSubmit(values: { plan: string }) {
    if (!plans.length || !values.plan) return;

    await onAddAction(values.plan);

    formik.setFieldValue('plan', '');
  }

  const renderPlans = useMemo(() => {
    return plans
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((opt) => ({ label: opt.name, value: opt.id }));
  }, [plans]);

  return (
    <div>
      <form onSubmit={formik.handleSubmit} autoComplete="off">
        <div className="mb-3 flex flex-row justify-start align-middle">
          <InputSelect
            name="plan"
            formik={formik}
            options={plans}
            value={undefined}
            renderOptions={renderPlans}
            onBlur={formik.handleBlur}
            selectClassWrapperName="mr-2 w-full"
            onChange={formik.handleChange}
          />
          <button
            className="outline-none focus:outline-none w-1/2 cursor-pointer rounded bg-brand-primary py-2 px-4 font-bold text-white focus:ring"
            type="submit"
          >
            Link Plan
          </button>
        </div>
      </form>
    </div>
  );
};

export default LinkPlanToOrganization;
