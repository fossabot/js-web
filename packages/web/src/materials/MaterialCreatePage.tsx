import { Formik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { AccessControl } from '../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import { AdminLayout } from '../layouts/admin.layout';
import { MaterialType } from '../models/baseMaterial';
import Button from '../ui-kit/Button';
import { MaterialCreateForm } from './MaterialCreateForm';
import {
  IMaterialCreateForm,
  materialCreateFormSchema,
} from './materialCreateForm.schema';
import { useMaterialForm } from './useMaterialForm';

const MaterialAddPage: FC<any> = () => {
  const { handleSubmitCreate } = useMaterialForm();
  const router = useRouter();

  async function handleFormSubmit(values: IMaterialCreateForm) {
    try {
      await handleSubmitCreate(values);
      await router.push(`/materials`);
    } catch (error) {
      alert(error);
    }
  }

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_MATERIAL_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>Create Material</title>
        </Head>
        <article className="mx-auto w-1/4">
          <header className="mb-4 text-heading font-bold">
            Create Material
          </header>
          <Formik<IMaterialCreateForm>
            initialValues={{
              displayName: '',
              language: '',
              file: null,
              materialType: MaterialType.MATERIAL_INTERNAL,
              url: '',
            }}
            validationSchema={materialCreateFormSchema}
            onSubmit={handleFormSubmit}
          >
            {(formik) => (
              <form onSubmit={formik.handleSubmit}>
                <MaterialCreateForm
                  fieldNames={{
                    displayName: 'displayName',
                    language: 'language',
                    materialType: 'materialType',
                    file: 'file',
                    url: 'url',
                  }}
                />
                <Button
                  variant="primary"
                  type="submit"
                  size="medium"
                  className="mt-8"
                  disabled={formik.isSubmitting}
                >
                  Add material
                </Button>
              </form>
            )}
          </Formik>
        </article>
      </AdminLayout>
    </AccessControl>
  );
};

export default MaterialAddPage;
