import { Formik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AccessControl } from '../app-state/accessControl';
import API_PATHS from '../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import { centralHttp } from '../http';
import { AdminLayout } from '../layouts/admin.layout';
import { BaseMaterial, MaterialExternal } from '../models/baseMaterial';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import Button from '../ui-kit/Button';
import { captureError } from '../utils/error-routing';
import { GetMaterialDto } from './GetMaterial.dto';
import { MaterialCreateForm } from './MaterialCreateForm';
import { IMaterialCreateForm } from './materialCreateForm.schema';
import { useMaterialForm } from './useMaterialForm';

function MaterialEditPage() {
  const [material, setMaterial] = useState<BaseMaterial | undefined>();
  const { handleSubmitUpdate } = useMaterialForm();
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      const { id } = router.query;
      const { data } = await centralHttp.get<BaseResponseDto<GetMaterialDto>>(
        API_PATHS.MATERIALS_ID.replace(':id', id as string),
      );
      setMaterial(data.data);
    };

    initialize().catch(captureError);
  }, []);

  async function handleFormSubmit(values: IMaterialCreateForm) {
    await handleSubmitUpdate(values, material);
    window.history.back();
  }

  if (!material) return null;
  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_MATERIAL_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>Edit Material</title>
        </Head>
        <article className="mx-auto w-1/4">
          <header className="mb-4 text-heading font-bold">Edit Material</header>
          <Formik<IMaterialCreateForm>
            initialValues={{
              displayName: material.displayName,
              language: material.language ?? undefined,
              file: null,
              materialType: material.type,
              url: (material as MaterialExternal).url,
            }}
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
                  forceMaterialType={material.type}
                />
                <Button
                  variant="primary"
                  type="submit"
                  size="medium"
                  className="mt-8"
                  disabled={formik.isSubmitting}
                >
                  Save
                </Button>
              </form>
            )}
          </Formik>
        </article>
      </AdminLayout>
    </AccessControl>
  );
}

export default MaterialEditPage;
