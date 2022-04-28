import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import useTranslation from '../i18n/useTranslation';
import cx from 'classnames';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import Picture from '../ui-kit/Picture';
import CenterLayout from './center.layout';

interface IIllustrationLayout {
  head?: React.ReactNode;
  header?: React.ReactNode;
  showImage?: boolean;
  children: ReactNode;
}

interface ICarouselProps {
  duration?: number;
  intervalDuration?: number;
}

const Carousel: React.FunctionComponent<ICarouselProps> = ({
  duration = 1000,
  intervalDuration = 5000,
}: ICarouselProps) => {
  const { t } = useTranslation();
  const [pause, setPause] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderRef, slider] = useKeenSlider({
    loop: true,
    duration,
    dragStart: () => {
      setPause(true);
    },
    dragEnd: () => {
      setPause(false);
    },
    initial: 0,
    slideChanged(s) {
      setCurrentSlide(s.details().relativeSlide);
    },
  });

  const slides = useMemo(
    () =>
      Array.from({ length: 3 }).map((_, index) => {
        return {
          image: '/assets/auth-page-graphic.webp',
          fallbackImage: '/assets/auth-page-graphic.png',
          caption: t(`illustrationLayout.slides.${index}.caption`),
          description: t(`illustrationLayout.slides.${index}.description`),
        };
      }),
    [],
  );

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
    <div className="overflow-hidden">
      <div
        ref={sliderRef as React.RefObject<HTMLDivElement>}
        className="keen-slider"
      >
        {slides.map((slide, index) => (
          <div className="keen-slider__slide" key={index}>
            <div className="mx-8">
              <Picture
                sources={[{ srcSet: slide.image, type: 'image/webp' }]}
                fallbackImage={{ src: slide.fallbackImage, alt: slide.caption }}
              />
            </div>
            <div className="mt-4 text-heading font-semibold lg:mt-10 lg:text-subtitle">
              {slide.caption}
            </div>
            <div className="mt-1 text-body text-gray-500">
              {slide.description}
            </div>
          </div>
        ))}
      </div>

      {slider && (
        <div className="mt-4 flex justify-center lg:mt-20">
          {slides.map((s, index) => (
            <button
              key={index}
              onClick={() => {
                slider.moveToSlideRelative(index);
              }}
              className={cx(
                'outline-none mx-2 h-2 w-2 rounded-full',
                currentSlide === index ? 'bg-gray-500' : 'bg-gray-300',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function IllustrationLayout({
  head,
  header,
  children,
  showImage = true,
}: IIllustrationLayout) {
  return (
    <CenterLayout head={head} header={header}>
      <div className="container box-border flex flex-1 flex-col justify-center lg:flex-row lg:items-center lg:justify-between">
        <div
          className={cx(
            'mx-6 mt-6 mb-8 text-center lg:my-0 lg:mt-0 lg:block lg:w-1/2 lg:pr-12 xl:mx-0',
            !showImage && 'hidden',
          )}
        >
          <div className="mx-auto mb-4 w-16 lg:my-0 lg:mb-16 lg:w-26">
            <Picture
              sources={[
                {
                  srcSet: '/assets/seac-logo-compact.webp',
                  type: 'image/webp',
                },
              ]}
              fallbackImage={{ src: '/assets/seac-logo-compact.png' }}
            />
          </div>
          <Carousel />
        </div>
        <div className="mx-6 box-border text-center lg:w-1/2 lg:pr-0 lg:pl-12 xl:mx-0">
          {children}
        </div>
      </div>
    </CenterLayout>
  );
}
