import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M14.027 17.5a11.53 11.53 0 01-8.146-3.387A11.576 11.576 0 012.5 5.95c0-.915.363-1.792 1.008-2.44A3.44 3.44 0 015.943 2.5c.193-.001.387.016.576.053.184.027.365.072.54.135a.748.748 0 01.486.562l1.025 4.5a.751.751 0 01-.194.69c-.098.105-.105.113-1.026.592a7.425 7.425 0 003.646 3.668c.486-.93.493-.938.598-1.035a.747.747 0 01.689-.195l4.49 1.027a.747.747 0 01.54.488 3.27 3.27 0 01.187 1.117 3.453 3.453 0 01-1.037 2.417 3.44 3.44 0 01-2.436.98z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
