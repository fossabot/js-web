import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      width={22}
      height={22}
      fill="none"
      viewBox="0 0 22 22"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.11 5.646a.783.783 0 00-.473-.146.79.79 0 00-.518.214l-5.668 5.085a.846.846 0 00-.21.29.882.882 0 00.21 1l5.668 5.08a.777.777 0 00.924.163c.1-.05.19-.122.262-.21a.862.862 0 00.19-.65.874.874 0 00-.104-.328.835.835 0 00-.221-.258l-3.914-3.511h10.66a.917.917 0 100-1.833H7.227l3.944-3.54a.852.852 0 00.267-.434.887.887 0 00-.023-.516.843.843 0 00-.304-.406z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
