import cx from 'classnames';

const PasswordStrength = ({ getPasswordStrength }) => (
  <div className="mb-3">
    <div className="mb-2 text-left text-sm">
      Password strength:{' '}
      <span className="font-bold">{getPasswordStrength().name}</span>
    </div>
    <div className="flex items-center">
      {[0, 1, 2, 3].map((val, key) => {
        const level = getPasswordStrength().level;

        return (
          <div
            key={key}
            className={cx('w-1/5', {
              'px-1': val > 0,
              'pr-1': val === 0,
            })}
          >
            <div
              className={cx('h-2 rounded-xl transition-colors', {
                'bg-gray-200': level <= val,
                'bg-red-200': val === 0 && level > val,
                'bg-yellow-200': val === 1 && level > val,
                'bg-blue-500': val === 2 && level > val,
                'bg-green-200': val === 3 && level > val,
              })}
            ></div>
          </div>
        );
      })}
    </div>
  </div>
);

export default PasswordStrength;
