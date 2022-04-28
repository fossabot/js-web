import { useKeenSlider } from 'keen-slider/react';
import { FC, useEffect, useState } from 'react';
import { PromoBanner } from '../../models/promoBanner';
import 'keen-slider/keen-slider.min.css';
import cx from 'classnames';
import { ChevronLeft, ChevronRight } from '../../ui-kit/icons';
import { useLocaleText } from '../../i18n/useLocaleText';
import resolveConfig from 'tailwindcss/resolveConfig';
import config from '../../../tailwind.config';
import { TOptionsEvents } from 'keen-slider';

const { theme } = resolveConfig(config);

export interface IPromoBannerCarousel {
  promoBanners: PromoBanner[];
  intervalDuration?: number;
  className?: string;
}

export const PromoBannerCarousel: FC<IPromoBannerCarousel> = (props) => {
  const { promoBanners, className } = props;
  const intervalDuration = props.intervalDuration || 5000;
  const [pause, setPause] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const keenSliderOptions: TOptionsEvents = {
    loop: true,
    breakpoints: {
      [`(min-width: ${theme.screens.lg})`]: {
        slidesPerView: 1.5,
      },
    },
    slidesPerView: 1,
    spacing: 24,
    centered: true,
    slideChanged(s) {
      setCurrentSlide(s.details().relativeSlide);
    },
  };
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>(keenSliderOptions);
  const localeText = useLocaleText();

  useEffect(() => {
    slider?.resize();
    if (promoBanners.length <= 2) {
      slider?.refresh({ ...keenSliderOptions, breakpoints: undefined });
    } else {
      slider?.refresh(keenSliderOptions);
    }
  }, [promoBanners]);
  useEffect(() => {
    sliderRef.current.addEventListener('mouseover', () => {
      setPause(true);
    });
    sliderRef.current.addEventListener('mouseout', () => {
      setPause(false);
    });
  }, [sliderRef]);
  useEffect(() => {
    const id = setInterval(() => {
      if (!pause && slider) {
        slider.next();
      }
    }, intervalDuration);

    return () => {
      clearInterval(id);
    };
  }, [pause, slider]);

  return (
    <>
      <div
        ref={sliderRef}
        className={cx('keen-slider mx-auto max-w-1440px', className)}
      >
        {
          // need to have at least on child for keen slider to be able to calculate size and display correctly
          promoBanners.length <= 0 && <div className="keen-slider__slide" />
        }
        {promoBanners.map((banner, index) => (
          <div
            className="keen-slider__slide"
            key={index}
            style={{ overflow: 'visible' }}
            onMouseOver={() => setPause(true)}
            onMouseOut={() => setPause(false)}
          >
            <div
              className="relative"
              style={{
                width: promoBanners.length > 2 ? 'fit-content' : 'auto',
              }}
            >
              <a
                className={cx('block', {
                  'cursor-default': index !== currentSlide,
                })}
                rel="noopener noreferrer"
                {...(index === currentSlide && {
                  href: banner.href,
                  target: '_blank',
                })}
              >
                <img
                  className={cx(
                    'h-80 w-full object-cover object-left lg:h-auto',
                    promoBanners.length > 2 && 'lg:rounded-3xl',
                  )}
                  src={
                    banner.assetKey.includes('http')
                      ? banner.assetKey
                      : process.env.NEXT_PUBLIC_CDN_BASE_URL +
                        '/' +
                        banner.assetKey
                  }
                />
                <div
                  className={cx(
                    'absolute inset-0 m-auto h-full w-full ',
                    promoBanners.length > 2 && 'lg:rounded-3xl',
                    {
                      'bg-white opacity-75': index !== currentSlide,
                    },
                  )}
                >
                  <div
                    className={cx(
                      'h-full w-92',
                      promoBanners.length > 2 && 'lg:rounded-3xl',
                      {
                        'bg-gradient-to-r from-brand-primary to-transparent opacity-70 lg:rounded-r-none':
                          banner.overlayColor,
                      },
                    )}
                    style={{ '--tw-gradient-from': banner.overlayColor } as any}
                  ></div>
                </div>
                <div
                  className="absolute inset-0 m-auto flex h-full w-full flex-col justify-center px-12 py-24"
                  style={{ color: banner.textColor }}
                >
                  {banner.header?.nameEn && (
                    <div className="text-hero-desktop font-semibold">
                      {localeText(banner.header)}
                    </div>
                  )}
                  {banner.subtitle?.nameEn && (
                    <div className="mt-1 text-heading">
                      {localeText(banner.subtitle)}
                    </div>
                  )}
                  {banner.cta?.nameEn && (
                    <div
                      className="mt-6 rounded-lg border p-4 text-caption font-bold"
                      style={{
                        width: 'fit-content',
                        borderColor: banner.textColor,
                      }}
                    >
                      {localeText(banner.cta)}
                    </div>
                  )}
                </div>
              </a>
              {index === currentSlide && (
                <>
                  <div
                    className={cx(
                      'absolute top-1/2 -right-5 hidden -translate-y-1/2 transform cursor-pointer',
                      { 'lg:block': promoBanners.length > 2 },
                    )}
                    onClick={slider?.next}
                  >
                    <div className="rounded-full border border-gray-300 bg-white p-2">
                      <ChevronRight className="h-6 w-6 text-brand-primary" />
                    </div>
                  </div>
                  <div
                    className={cx(
                      'absolute top-1/2 -left-5 hidden -translate-y-1/2 transform cursor-pointer',
                      { 'lg:block': promoBanners.length > 2 },
                    )}
                    onClick={slider?.prev}
                  >
                    <div className="rounded-full border border-gray-300 bg-white p-2">
                      <ChevronLeft className="h-6 w-6 text-brand-primary" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 ml-6 flex space-x-2 lg:ml-0 lg:justify-center">
        {promoBanners.map((banner, index) => (
          <button
            key={index}
            onClick={() => slider.moveToSlideRelative(index)}
            className={cx(
              'outline-none h-2 w-2 rounded-full',
              currentSlide === index ? 'bg-brand-primary' : 'bg-gray-300',
            )}
          />
        ))}
      </div>
    </>
  );
};
