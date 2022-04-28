import Button from './Button';

export default function LoadError({
  onRetry,
  imageSrc,
  loadErrorMsg,
  retryMsg,
}: {
  onRetry: () => void;
  imageSrc: string;
  loadErrorMsg: string;
  retryMsg: string;
}) {
  return (
    <div className="flex flex-col items-center lg:mt-32">
      <img src={imageSrc} className="mb-4" />
      <div className="text-subheading font-bold text-gray-400">
        {loadErrorMsg}
      </div>
      <div className="mx-auto mt-4 w-24">
        <Button
          type="button"
          variant="secondary"
          size="medium"
          onClick={onRetry}
        >
          {retryMsg}
        </Button>
      </div>
    </div>
  );
}
