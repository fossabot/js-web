import { Field, FieldArrayRenderProps, getIn } from 'formik';
import { ChangeEvent, FC } from 'react';
import { ImageUpload } from '../ui-kit/ImageUpload';
import InputField from '../ui-kit/InputField';
import Button from '../ui-kit/Button';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { Plus, Trash, ProgressCircle } from '../ui-kit/icons';
import { ContentDisclosure } from '../ui-kit/ContentDisclosure';
import { InputRadioCard } from './InputRadioCard';
import cx from 'classnames';
import { useToasts } from 'react-toast-notifications';
import { DeleteSuccessMessage } from './DeleteSuccessMessage';
import { Banner, COLOR } from './promoBanner.schema';
import mime from 'mime';
import { isNumber } from 'lodash';
import useTranslation from '../i18n/useTranslation';
import InputSection from '../ui-kit/InputSection';

export const PromoBannerForm: FC<FieldArrayRenderProps> = (props) => {
  const { swap, push, remove, form, insert } = props;
  const { addToast, removeToast } = useToasts();
  const { t } = useTranslation();
  const banners: Banner[] = form.values.banners;
  const initialBanner: Banner = {
    percent: null,
    assetKey: '',
    headerEn: '',
    headerTh: '',
    subtitleEn: '',
    subtitleTh: '',
    ctaEn: '',
    ctaTh: '',
    href: '',
    overlayColor: COLOR.NONE,
    textColor: COLOR.BLACK,
  };

  function handleUndo(index: number, toastId: string, data: any) {
    insert(index, data);
    removeToast(toastId);
  }

  async function handleDelete(index: number) {
    const data = banners[index];
    remove(index);
    const toastId = await new Promise<string>((resolve) => {
      addToast(
        <DeleteSuccessMessage onUndo={() => handleUndo(index, toastId, data)}>
          <span>
            {t('promoBannerPage.deleteSuccess', { number: index + 1 })}
          </span>
        </DeleteSuccessMessage>,
        {
          appearance: 'success',
          onDismiss() {
            URL.revokeObjectURL(data.assetKey);
          },
        },
        resolve,
      );
    });
  }

  function onChangeImage(evt: ChangeEvent<HTMLInputElement>, index: number) {
    // clear previous image from memory before applying new one
    URL.revokeObjectURL(banners[index].assetKey);

    const objectUrl = URL.createObjectURL(evt.target.files[0]);
    form.setFieldValue(`banners.${index}.assetKey`, objectUrl);
  }

  function getPreviewSrc(assetKey: string) {
    if (assetKey.startsWith('blob') || assetKey === '') {
      return assetKey;
    }
    return `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${assetKey}`;
  }

  function getErrorMessage(field: string) {
    const msg = getIn(form.errors, field);
    if (msg) {
      return t(msg);
    }
    return null;
  }

  return (
    <>
      {banners.map((banner, index: number) => (
        <section className="flex items-center space-x-4" key={index}>
          <div className="sticky top-20 my-4 flex items-center space-x-4 self-start">
            <div>
              <Button
                type="button"
                variant="primary"
                className={cx('p-2', { invisible: index === 0 })}
                onClick={() => swap(index, index - 1)}
              >
                <FaArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="primary"
                className="mt-2 p-2"
                onClick={() => handleDelete(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="primary"
                className={cx('mt-2 p-2', {
                  invisible: index === form.values.banners.length - 1,
                })}
                onClick={() => swap(index, index + 1)}
              >
                <FaArrowDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-heading font-semibold">
              {index + 1}
            </div>
          </div>
          <ContentDisclosure
            title={
              <div className="relative">
                <img
                  src={
                    getPreviewSrc(banner.assetKey) ||
                    'https://dummyimage.com/976x305/A80030/ffffff?text=N/A'
                  }
                  className={cx('w-48', {
                    'border-4 border-black': getErrorMessage(
                      `banners.${index}.assetKey`,
                    ),
                  })}
                />
                <div>{getErrorMessage(`banners.${index}.assetKey`)}</div>
                <div
                  className={cx(
                    'absolute inset-0 m-auto flex h-full w-full items-center justify-center bg-white font-bold opacity-0 transition-opacity duration-500',
                    { 'opacity-90': isNumber(banner.percent) },
                  )}
                >
                  <ProgressCircle
                    className="h-12 w-12"
                    percentage={banner.percent}
                  />
                </div>
              </div>
            }
          >
            <div className="rounded-2xl border p-4">
              <label>
                <span className="text-heading font-semibold">
                  {t('promoBannerPage.image')} *
                </span>
                <ImageUpload
                  name={`banners.${index}.assetKey`}
                  previewSrc={getPreviewSrc(banner.assetKey)}
                  className="w-80"
                  accept={[mime.getType('jpg'), mime.getType('png')].join(',')}
                  onChange={(evt) => onChangeImage(evt, index)}
                  percent={banner.percent}
                />
              </label>
              <section className="mt-8 flex space-x-4">
                <div className="w-full">
                  <div className="text-heading font-semibold">
                    {t('promoBannerPage.header')}
                  </div>
                  <label className="mt-2">
                    <span>{t('promoBannerPage.en')}</span>
                    <Field name={`banners.${index}.headerEn`} as={InputField} />
                  </label>
                  <label className="mt-4 block">
                    <span>{t('promoBannerPage.th')}</span>
                    <Field name={`banners.${index}.headerTh`} as={InputField} />
                  </label>
                </div>
                <div className="w-full">
                  <div className="text-heading font-semibold">
                    {t('promoBannerPage.subtitle')}
                  </div>
                  <label>
                    <span>{t('promoBannerPage.en')}</span>
                    <Field
                      name={`banners.${index}.subtitleEn`}
                      as={InputField}
                    />
                  </label>
                  <label className="mt-4 block">
                    <span>{t('promoBannerPage.th')}</span>
                    <Field
                      name={`banners.${index}.subtitleTh`}
                      as={InputField}
                    />
                  </label>
                </div>
                <div className="w-full">
                  <div className="text-heading font-semibold">
                    {t('promoBannerPage.cta')}
                  </div>
                  <label>
                    <span>{t('promoBannerPage.en')}</span>
                    <Field name={`banners.${index}.ctaEn`} as={InputField} />
                  </label>
                  <label className="mt-4 block">
                    <span>{t('promoBannerPage.th')}</span>
                    <Field name={`banners.${index}.ctaTh`} as={InputField} />
                  </label>
                </div>
              </section>
              <section>
                <label>
                  <div className="mt-8 mb-2 text-heading font-semibold">
                    {t('promoBannerPage.link')} *
                  </div>
                  <Field
                    name={`banners.${index}.href`}
                    as={InputSection}
                    error={getIn(form.errors, `banners.${index}.href`)}
                  />
                </label>
              </section>
              <section className="mt-8">
                <div className="text-heading font-semibold">
                  {t('promoBannerPage.gradient')}
                </div>
                <div className="mt-4 flex space-x-2">
                  <Field
                    name={`banners.${index}.overlayColor`}
                    identifier={COLOR.NONE}
                    className="w-24"
                    as={InputRadioCard}
                  >
                    <div className="font-semibold">
                      {t('promoBannerPage.color.none')}
                    </div>
                  </Field>
                  <Field
                    name={`banners.${index}.overlayColor`}
                    identifier={COLOR.BRNAD_PRIMARY}
                    className="w-24"
                    as={InputRadioCard}
                  >
                    <div className="bg-gradient-to-r from-brand-primary to-transparent px-8 py-2"></div>
                    <div className="mt-2 font-semibold text-brand-primary">
                      {t('promoBannerPage.color.red')}
                    </div>
                  </Field>
                  <Field
                    name={`banners.${index}.overlayColor`}
                    identifier={COLOR.BLACK}
                    className="w-24"
                    as={InputRadioCard}
                  >
                    <div className="bg-gradient-to-r from-black to-transparent px-8 py-2"></div>
                    <div className="mt-2 font-semibold">
                      {t('promoBannerPage.color.black')}
                    </div>
                  </Field>
                  <Field
                    name={`banners.${index}.overlayColor`}
                    identifier={COLOR.WHITE}
                    className="w-24"
                    as={InputRadioCard}
                  >
                    <div className="bg-gradient-to-r from-white to-transparent px-8 py-2"></div>
                    <div className="mt-2 font-semibold">
                      {t('promoBannerPage.color.white')}
                    </div>
                  </Field>
                </div>
              </section>
              <section className="mt-8">
                <div className="text-heading font-semibold">
                  {t('promoBannerPage.textColor')}
                </div>
                <div className="mt-4 flex space-x-2">
                  <Field
                    name={`banners.${index}.textColor`}
                    identifier={COLOR.BLACK}
                    as={InputRadioCard}
                  >
                    <div className="mx-auto h-8 w-8 rounded-full bg-black"></div>
                    <div className="mt-2 font-semibold">
                      {t('promoBannerPage.color.black')}
                    </div>
                  </Field>
                  <Field
                    name={`banners.${index}.textColor`}
                    identifier={COLOR.WHITE}
                    as={InputRadioCard}
                  >
                    <div className="mx-auto h-8 w-8 rounded-full bg-white"></div>
                    <div className="mt-2 font-semibold">
                      {t('promoBannerPage.color.white')}
                    </div>
                  </Field>
                </div>
              </section>
            </div>
          </ContentDisclosure>
        </section>
      ))}
      {typeof form.errors.banners === 'string' && (
        <div className="text-caption font-semibold text-red-300">
          {t(form.errors.banners, { number: 1 })}
        </div>
      )}
      {banners.length < 15 && (
        <Button className="mt-4 p-2" onClick={() => push(initialBanner)}>
          <Plus />
        </Button>
      )}
    </>
  );
};
