import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      width={17}
      height={17}
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.27311 8.54942C4.20113 8.44823 4.164 8.32815 4.16682 8.20587L4.16667 8.20587C4.17011 8.06662 4.2252 7.93304 4.32209 7.8289L8.02051 3.70632C8.07838 3.64158 8.15028 3.58959 8.23124 3.55394C8.3122 3.5183 8.40031 3.49984 8.48946 3.49984C8.57862 3.49984 8.66673 3.5183 8.74769 3.55394C8.82865 3.58959 8.90048 3.64158 8.95835 3.70632L12.6532 7.8289C12.7132 7.88624 12.7601 7.95477 12.791 8.03022C12.8219 8.10567 12.8361 8.1864 12.8329 8.26735C12.8296 8.34831 12.8089 8.42775 12.7719 8.5007C12.735 8.57364 12.6828 8.63853 12.6184 8.69129C12.554 8.74404 12.4788 8.78354 12.3977 8.8073C12.3166 8.83105 12.2312 8.83856 12.1469 8.82936C12.0625 8.82015 11.9811 8.79442 11.9077 8.75378C11.8343 8.71314 11.7705 8.65847 11.7202 8.59319L9.16667 5.74667L9.16667 13.4998C9.16667 13.868 8.86819 14.1665 8.5 14.1665C8.13181 14.1665 7.83333 13.868 7.83333 13.4998L7.83333 5.72419L5.25873 8.59319C5.17723 8.68756 5.067 8.75534 4.94327 8.78712C4.81955 8.81889 4.68855 8.81307 4.56845 8.77047C4.44835 8.72787 4.34508 8.65061 4.27311 8.54942Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
