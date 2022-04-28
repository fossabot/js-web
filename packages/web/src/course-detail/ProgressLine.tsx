import { FC } from 'react';
import { IdleProgressIndicator } from '../ui-kit/IdleProgressIndicator';
import { CompleteProgressIndicator } from '../ui-kit/CompleteProgressIndicator';
import { InProgressIndicator } from '../ui-kit/InProgressIndicator';
import classNames from 'classnames';

export interface IProgressLine {
  percentage: number;
  path: boolean;
}

export const ProgressLine: FC<IProgressLine> = (props) => {
  const { percentage, path } = props;

  const renderProgress = () => {
    if (percentage >= 100) {
      return <CompleteProgressIndicator />;
    }
    if (percentage <= 0) {
      return <IdleProgressIndicator />;
    }
    return <InProgressIndicator />;
  };

  return (
    <>
      {renderProgress()}
      {path && (
        <div className="flex h-full justify-center">
          <div
            className={classNames('border', {
              'border-green-100': percentage >= 100,
              'border-gray-200': percentage < 100,
            })}
          />
        </div>
      )}
    </>
  );
};
