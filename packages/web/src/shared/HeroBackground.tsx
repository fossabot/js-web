export default function HeroBackground(props) {
  return (
    <svg
      width="100vw"
      height="22.91vw"
      className="absolute top-0 lg:-mt-2"
      viewBox="0 0 1440 330"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: '100%', ...props.style }}
      {...props}
    >
      <g clipPath="url(#clip0)">
        <path d="M0 0H1439.54V261.196L0 330.076V0Z" fill="#860026" />
        <path
          d="M435 -3.88556L1954.65 488.079L2070.51 -60.3463L550.861 -552.311L435 -3.88556Z"
          fill="#A80030"
          fillOpacity="0.8"
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width={1440} height={330} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
