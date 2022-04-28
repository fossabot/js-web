import cx from 'classnames';
import * as passwordUtil from '../utils/password';
import useTranslation from '../i18n/useTranslation';
import { Close, Check } from '../ui-kit/icons';

const PasswordRules = ({ password, touched }) => {
  const { t } = useTranslation();

  return (
    <div
      style={{ backdropFilter: '42px' }}
      className="relative rounded-md border border-gray-300 bg-gray-100 p-4 text-footnote font-regular text-black lg:bg-opacity-95 lg:p-6"
    >
      <div
        style={{
          borderTop: '6px dashed transparent',
          borderBottom: '6px dashed transparent',
          borderLeft: '6px dashed #D2D2D2',
        }}
        className="triangle absolute left-full hidden h-0 w-0 rotate-90 lg:block"
      />
      <div className="text-left">{t('passwordRule.title')}</div>
      <div className="flex w-55">
        <ul>
          {passwordUtil.rules.map((pr, index) => {
            const isValid = pr.isValid(password);
            const isDirty = touched || password.length > 0;

            return (
              <li className="mt-2 flex items-center" key={index}>
                <div
                  className={cx({
                    ['text-red-200']: isDirty && !isValid,
                    ['text-black']: !isDirty,
                    ['text-green-200']: isValid,
                  })}
                >
                  {isDirty && !isValid ? (
                    <Close className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={cx('ml-3 text-left', {
                    ['text-red-200']: isDirty && !isValid,
                    ['text-black']: !isDirty || isValid,
                  })}
                >
                  {pr.name}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PasswordRules;
