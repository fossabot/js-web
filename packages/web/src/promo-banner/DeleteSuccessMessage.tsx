import { Dispatch, MouseEvent, FC } from 'react';
import Button from '../ui-kit/Button';
import { Reply } from '../ui-kit/icons';

export interface IDeleteSuccessMessage {
  onUndo: Dispatch<MouseEvent<HTMLElement>>;
}

export const DeleteSuccessMessage: FC<IDeleteSuccessMessage> = (props) => {
  const { onUndo, children } = props;

  return (
    <div className="flex items-center space-x-4">
      <div>{children}</div>
      <Button
        variant="ghost"
        className="flex max-w-min cursor-pointer items-center rounded-lg border border-white px-3 py-2 text-white"
        onClick={onUndo}
      >
        <Reply className="mr-1 h-4 w-4" />
        <div>Undo</div>
      </Button>
    </div>
  );
};
