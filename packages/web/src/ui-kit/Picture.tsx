interface ISource {
  srcSet: string;
  media?: string;
  type?: 'image/jpeg' | 'image/gif' | 'image/png' | 'image/webp' | 'image/svg';
}

interface IFallBackImage {
  src: string;
  srcSet?: string;
  alt?: string;
  [x: string]: any;
}

interface IPictureProps {
  className?: string;
  sources?: ISource[];
  fallbackImage: IFallBackImage;
}

export default function Picture({
  className,
  sources = [],
  fallbackImage,
}: IPictureProps) {
  return (
    <picture>
      {sources &&
        sources.length &&
        sources.map((s, index) => (
          <source key={index} srcSet={s.srcSet} type={s.type} media={s.media} />
        ))}
      <img
        {...fallbackImage}
        src={fallbackImage.src}
        alt={fallbackImage.alt}
        srcSet={fallbackImage.srcSet}
        className={className}
      />
    </picture>
  );
}
