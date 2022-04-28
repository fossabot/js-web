import { useKeenSlider } from 'keen-slider/react';
import { FC } from 'react';
import 'keen-slider/keen-slider.min.css';
import cx from 'classnames';
import resolveConfig from 'tailwindcss/resolveConfig';
import config from '../../../tailwind.config';
import { TOptionsEvents } from 'keen-slider';
import { times } from 'lodash';

const { theme } = resolveConfig(config);

export const PromoBannerCarouselSkeleton: FC<Record<string, never>> = () => {
  const keenSliderOptions: TOptionsEvents = {
    loop: true,
    breakpoints: {
      [`(min-width: ${theme.screens.lg})`]: {
        slidesPerView: 1.5,
      },
    },
    slidesPerView: 1,
    spacing: 20,
    centered: true,
    controls: false,
  };
  const [sliderRef] = useKeenSlider<HTMLDivElement>(keenSliderOptions);

  return (
    <>
      <div ref={sliderRef} className={cx('keen-slider mx-auto max-w-1440px')}>
        {times(3, (index) => (
          <div
            className="keen-slider__slide"
            key={index}
            style={{ overflow: 'visible' }}
          >
            <div className="h-80 w-full animate-pulse rounded-none bg-gray-200 lg:h-72 lg:w-auto lg:rounded-3xl" />
          </div>
        ))}
      </div>
      <div className="mt-8 ml-6 flex lg:ml-0 lg:justify-center">
        <div className="h-1 w-16 animate-pulse rounded bg-gray-200" />
      </div>
    </>
  );
};
