import { Form, Formik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AccessControl } from '../app-state/accessControl';
import API_PATHS from '../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import { useJWPlayer } from '../hooks/useJWPlayer';
import { centralHttp } from '../http';
import { AdminLayout } from '../layouts/admin.layout';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { Media, MediaStatus } from '../models/media';
import Button from '../ui-kit/Button';
import { JWPlayerScript } from '../ui-kit/JWPlayerScript';
import { captureError } from '../utils/error-routing';
import { useVideoForm } from './useVideoForm';
import { VideoCreateForm } from './VideoCreateForm';
import { VideoCreateFormValue, videoEditFormSchema } from './videoForm.schema';

export function VideoEditPage() {
  const { editVideo } = useVideoForm();
  const [media, setMedia] = useState<Media | undefined>();
  const { init, id } = useJWPlayer('video-preview', media);
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      const { id } = router.query;

      const { data } = await centralHttp.get<BaseResponseDto<Media>>(
        API_PATHS.MEDIA_ID.replace(':id', id as string),
      );

      setMedia(data.data);
    };

    initialize().catch(captureError);
  }, []);

  async function handleSubmit(values: VideoCreateFormValue) {
    await editVideo(media.id, values);
    window.location.reload();
  }

  if (!media) return null;
  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_VIDEO_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <JWPlayerScript onLoad={init} />
        <Head>
          <title>{`Edit ${media.title}`}</title>
        </Head>
        <article className="mx-auto w-1/4">
          <header className="mb-4 text-heading font-bold">{`Edit ${media.title}`}</header>
          <Formik<VideoCreateFormValue>
            initialValues={{
              title: media.title,
              description: media.description || '',
              file: null,
            }}
            validationSchema={videoEditFormSchema}
            onSubmit={handleSubmit}
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
                <div className="mt-8">
                  <div className="mb-4 text-heading font-bold">
                    Video preview
                  </div>
                  {media.status === MediaStatus.Created && (
                    <div>
                      This video is still processing. Please try again in a few
                      more minutes
                    </div>
                  )}
                  {media.status === MediaStatus.Available && <div id={id} />}
                </div>
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
}
