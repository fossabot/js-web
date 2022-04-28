import { Refresh, LaptopError } from './icons';

export const SystemError: React.FC<{
  title?: string;
  description?: string;
  error: any;
  resetError?: any;
}> = ({
  resetError,
  title = 'Something went wrong',
  description = 'Sorry for an inconvenience. Please try again.',
}) => {
  return (
    <div className=" flex h-full w-full flex-col items-center justify-center">
      <LaptopError />
      <p className="mb-2 text-xl font-semibold">{title}</p>
      <p className="mb-5 text-body font-normal text-gray-500">{description}</p>
      {resetError && (
        <div
          className="flex cursor-pointer items-center space-x-2 text-brand-primary"
          onClick={resetError}
        >
          <Refresh />
          <p className="text-sm font-semibold">Retry</p>
        </div>
      )}
    </div>
  );
};
