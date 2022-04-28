import * as Yup from 'yup';

export enum COLOR {
  NONE = 'none',
  BRNAD_PRIMARY = '#A80030',
  BLACK = 'black',
  WHITE = 'white',
}

export interface Banner {
  percent?: number; // for tracking image upload
  assetKey: string;
  headerEn: string;
  headerTh: string;
  subtitleEn: string;
  subtitleTh: string;
  ctaTh: string;
  ctaEn: string;
  href: string;
  overlayColor: COLOR;
  textColor: COLOR;
}

export interface PromoBannerFormValues {
  banners: Banner[];
}

export const promoBannerSchema = Yup.object().shape({
  banners: Yup.array()
    .of(
      Yup.object().shape({
        assetKey: Yup.string().required('required'),
        href: Yup.string()
          .url('promoBannerPage.invalidUrl')
          .required('required'),
      }),
    )
    .min(1, 'promoBannerPage.minItems')
    .required(),
});
