import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg
      {...props}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.8327 2.49984C10.8327 2.0396 10.4596 1.6665 9.99935 1.6665C9.53911 1.6665 9.16602 2.0396 9.16602 2.49984V3.33317C9.16602 3.79341 9.53911 4.1665 9.99935 4.1665C10.4596 4.1665 10.8327 3.79341 10.8327 3.33317V2.49984ZM4.75527 3.57725C4.42983 3.25181 3.9022 3.25181 3.57676 3.57725C3.25132 3.90269 3.25132 4.43032 3.57676 4.75576L4.41009 5.58909C4.73553 5.91453 5.26317 5.91453 5.5886 5.58909C5.91404 5.26366 5.91404 4.73602 5.5886 4.41058L4.75527 3.57725ZM16.4219 3.57725C16.0965 3.25181 15.5689 3.25181 15.2434 3.57725L14.4101 4.41058C14.0847 4.73602 14.0847 5.26366 14.4101 5.58909C14.7355 5.91453 15.2632 5.91453 15.5886 5.58909L16.4219 4.75576C16.7474 4.43032 16.7474 3.90269 16.4219 3.57725ZM9.99935 5.83317C7.69816 5.83317 5.83268 7.69865 5.83268 9.99984C5.83268 12.301 7.69816 14.1665 9.99935 14.1665C12.3005 14.1665 14.166 12.301 14.166 9.99984C14.166 7.69865 12.3005 5.83317 9.99935 5.83317ZM2.49935 9.1665C2.03911 9.1665 1.66602 9.5396 1.66602 9.99984C1.66602 10.4601 2.03911 10.8332 2.49935 10.8332H3.33268C3.79292 10.8332 4.16602 10.4601 4.16602 9.99984C4.16602 9.5396 3.79292 9.1665 3.33268 9.1665H2.49935ZM16.666 9.1665C16.2058 9.1665 15.8327 9.5396 15.8327 9.99984C15.8327 10.4601 16.2058 10.8332 16.666 10.8332H17.4993C17.9596 10.8332 18.3327 10.4601 18.3327 9.99984C18.3327 9.5396 17.9596 9.1665 17.4993 9.1665H16.666ZM5.5886 15.5891C5.91404 15.2637 5.91404 14.736 5.5886 14.4106C5.26317 14.0851 4.73553 14.0851 4.41009 14.4106L3.57676 15.2439C3.25132 15.5694 3.25132 16.097 3.57676 16.4224C3.9022 16.7479 4.42983 16.7479 4.75527 16.4224L5.5886 15.5891ZM15.5886 14.4106C15.2632 14.0851 14.7355 14.0851 14.4101 14.4106C14.0847 14.736 14.0847 15.2637 14.4101 15.5891L15.2434 16.4224C15.5689 16.7479 16.0965 16.7479 16.4219 16.4224C16.7474 16.097 16.7474 15.5694 16.4219 15.2439L15.5886 14.4106ZM10.8327 16.6665C10.8327 16.2063 10.4596 15.8332 9.99935 15.8332C9.53911 15.8332 9.16602 16.2063 9.16602 16.6665V17.4998C9.16602 17.9601 9.53911 18.3332 9.99935 18.3332C10.4596 18.3332 10.8327 17.9601 10.8327 17.4998V16.6665Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgComponent;
