import { Form, Formik } from 'formik';
import Head from 'next/head';
import { FC } from 'react';
import { AccessControl } from '../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import { AdminLayout } from '../layouts/admin.layout';
import Button from '../ui-kit/Button';
import { useVideoForm } from './useVideoForm';
import { VideoCreateForm } from './VideoCreateForm';
import {
  videoCreateFormSchema,
  VideoCreateFormValue,
} from './videoForm.schema';

export const VideoCreatePage: FC<any> = () => {
  const { createVideo } = useVideoForm();

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_VIDEO_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>Create Video</title>
        </Head>
        <article className="mx-auto w-1/4">
          <header className="mb-4 text-heading font-bold">Create Video</header>
          <Formik<VideoCreateFormValue>
            initialValues={{
              title: '',
              description: '',
              file: null,
            }}
            validationSchema={videoCreateFormSchema}
            onSubmit={createVideo}
          >
            {(formik) => (
              <Form>
                <VideoCreateForm
                  fieldNames={{
                    title: 'title',
                    description: 'description',
                    file: 'file',
                  }}
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
              </Form>
            )}
          </Formik>
        </article>
      </AdminLayout>
    </AccessControl>
  );
};
