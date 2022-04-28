import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.39 5.646a.783.783 0 01.472-.146.79.79 0 01.519.214l5.668 5.085c.09.08.16.178.21.29a.882.882 0 01-.21 1l-5.668 5.08a.777.777 0 01-.924.163.816.816 0 01-.262-.21.862.862 0 01-.19-.65.874.874 0 01.104-.328.835.835 0 01.22-.258l3.915-3.511H4.584a.917.917 0 010-1.833h10.69l-3.944-3.54a.852.852 0 01-.267-.434.886.886 0 01.023-.516.844.844 0 01.304-.406z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
