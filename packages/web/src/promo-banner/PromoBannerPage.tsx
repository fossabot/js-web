import { FieldArray, Form, Formik } from 'formik';
import Head from 'next/head';
import { useEffect } from 'react';
import { AccessControl } from '../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import { PromoBannerCarousel } from '../dashboard/components/PromoBannerCarousel';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import Button from '../ui-kit/Button';
import { ContentDisclosure } from '../ui-kit/ContentDisclosure';
import { captureError } from '../utils/error-routing';
import {
  COLOR,
  PromoBannerFormValues,
  promoBannerSchema,
} from './promoBanner.schema';
import { PromoBannerForm } from './PromoBannerForm';
import { usePromoBannerPage } from './usePromoBannerPage';

const PromoBannerPage = () => {
  const { handleSubmit, fetchBanners, promoBanners } = usePromoBannerPage();
  const { t } = useTranslation();

  useEffect(() => {
    fetchBanners().catch(captureError);
  }, []);

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_PROMO_BANNER,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('promoBannerPage.metaTitle')}</title>
        </Head>
        <div className="text-heading font-semibold">
          {t('promoBannerPage.title')}
        </div>
        <ContentDisclosure title={t('promoBannerPage.guidelines')}>
          <div className="rounded-2xl border p-8">
            <img src="/assets/guide-desktop.png" />
            <img src="/assets/guide-mobile.png" />
          </div>
        </ContentDisclosure>
        <Formik<PromoBannerFormValues>
          initialValues={{
            banners:
              promoBanners?.map((banner) => ({
                headerEn: banner.header?.nameEn || '',
                headerTh: banner.header?.nameTh || '',
                subtitleEn: banner.subtitle?.nameEn || '',
                subtitleTh: banner.subtitle?.nameTh || '',
                ctaEn: banner.cta?.nameEn || '',
                ctaTh: banner.cta?.nameTh || '',
                assetKey: banner.assetKey,
                overlayColor: (banner.overlayColor as COLOR) || COLOR.NONE,
                textColor: banner.textColor as COLOR,
                href: banner.href,
              })) || [],
          }}
          enableReinitialize
          validationSchema={promoBannerSchema}
          onSubmit={handleSubmit}
        >
          {(form) => (
            <>
              <Form>
                <fieldset disabled={form.isSubmitting}>
                  <FieldArray name="banners" component={PromoBannerForm} />
                  <Button
                    variant="primary"
                    type="submit"
                    className="mt-8 p-2"
                    isLoading={form.isSubmitting}
                    disabled={
                      form.values.banners.length <= 0 || form.isSubmitting
                    }
                  >
                    {t('promoBannerPage.save')}
                  </Button>
                </fieldset>
              </Form>
              <div className="mt-8 mb-4 text-heading font-bold">Preview</div>
              <div className="mx-auto">
                <PromoBannerCarousel
                  className="-mx-8"
                  promoBanners={form.values.banners.map((banner, index) => ({
                    header: {
                      nameEn: banner.headerEn || null,
                      nameTh: banner.headerTh || null,
                    },
                    subtitle: {
                      nameEn: banner.subtitleEn || null,
                      nameTh: banner.subtitleTh || null,
                    },
                    cta: {
                      nameEn: banner.ctaEn || null,
                      nameTh: banner.ctaTh || null,
                    },
                    assetKey: banner.assetKey,
                    overlayColor: banner.overlayColor,
                    textColor: banner.textColor,
                    href: banner.href,
                    sequence: index,
                    id: '',
                    isActive: false,
                    createdAt: '',
                    updatedAt: '',
                  }))}
                />
              </div>
            </>
          )}
        </Formik>
      </AdminLayout>
    </AccessControl>
  );
};

export default PromoBannerPage;
