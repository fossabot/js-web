import { FaCube, FaUnlockAlt } from 'react-icons/fa';

import Button from './Button';
import InputField from './InputField';

const UIDesignExample = () => {
  return (
    <div className="flex max-w-xl flex-col items-center justify-center gap-5 self-center pt-3">
      <div className="my-3">
        <h1 className="mb-2 text-hero-mobile font-bold lg:text-hero-desktop">
          Buttons
        </h1>
        <Button
          iconRight={
            <FaUnlockAlt className="text-grey-400 h-3 w-3" aria-hidden="true" />
          }
          className="w-1/6"
          iconWrapperClassName={'pl-20'}
          variant={'primary'}
          type="button"
          size="small"
        >
          Small
        </Button>
        <Button
          className="w-1/6"
          variant={'secondary'}
          type="button"
          size="medium"
        >
          Medium
        </Button>
        <Button
          className="w-1/6"
          variant={'secondary'}
          type="button"
          size="large"
        >
          Large
        </Button>
        <Button
          className="w-1/6"
          variant={'secondary'}
          type="button"
          disabled={true}
          size="small"
        >
          Disabled
        </Button>
        <Button className="w-1/6" variant={'ghost'} type="button" size="small">
          Ghost
        </Button>
        <Button
          className="w-1/6"
          variant={'ghost'}
          type="button"
          disabled={true}
          size="small"
        >
          Ghost Disabled
        </Button>
        <Button
          iconLeft={
            <FaUnlockAlt
              className="text-grey-400 mr-2 h-5 w-5"
              aria-hidden="true"
            />
          }
          iconWrapperClassName={'pr-20'}
          variant={'ghost'}
          type="button"
          disabled={true}
          size="small"
        >
          Left ICON
        </Button>
        <p>Rounded Button</p>
        <Button variant={'round'} type="button" size="small">
          <FaUnlockAlt className="h-5 w-5 text-white" aria-hidden="true" />
        </Button>
        <Button variant={'round'} type="button" size="medium">
          <FaUnlockAlt className="h-6 w-6 text-white" aria-hidden="true" />
        </Button>
        <Button variant={'round'} type="button" size="large">
          <FaUnlockAlt className="h-8 w-8 text-white" aria-hidden="true" />
        </Button>
      </div>
      <div className="my-3">
        <h1 className="mb-2 text-hero-mobile font-bold lg:text-hero-desktop">
          Input
        </h1>
        <div className="mb-2">
          <InputField
            name="text"
            withInlineButtonProps={{
              text: 'Click here',
              buttonProps: {
                onClick: () => {
                  console.log('Clicked');
                },
              },
            }}
          />
        </div>
        <div className="mb-2">
          <InputField name="text" withInlineTextAndIconProps={{}} />
        </div>
        <div className="mb-2">
          <InputField
            name="text"
            withInlineTextAndIconProps={{
              text: 'Custom',
              icon: <FaCube />,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UIDesignExample;
