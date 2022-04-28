import InputSection from '../ui-kit/InputSection';
import { useField } from 'formik';
import cx from 'classnames';
import useTranslation from '../i18n/useTranslation';
import WEB_PATHS from '../constants/webPaths';
import Link from 'next/link';
import Eye2 from '../ui-kit/icons/Eye2';
import { MarkdownEditor } from '../ui-kit/MarkdownEditor';

interface IProps {
  fieldNames: {
    bio: string;
    shortSummary: string;
    experience: string;
  };
  id: string;
  isInstructor: boolean;
  updateCharacterCount: (fieldName: string, count: number) => void;
}

export const Instructor: React.FC<IProps> = ({
  fieldNames,
  isInstructor,
  id,
  updateCharacterCount,
}) => {
  const { t } = useTranslation();
  const [fieldBio, , bioHelpers] = useField<string>(fieldNames.bio);
  const [fieldShortSummary] = useField<string>(fieldNames.shortSummary);
  const [fieldExperience, , experienceHelpers] = useField(
    fieldNames.experience,
  );

  return (
    <section
      className={cx({
        'flex flex-col': isInstructor,
        hidden: !isInstructor,
      })}
    >
      <div className="mb-2 flex flex-row items-center justify-between">
        <p className="text-subheading font-bold">
          {t('profilePage.instructor.sectionTitle')}
        </p>
        <div className="flex flex-row space-x-2 text-brand-primary ">
          <Eye2 className="h-4 w-4 text-brand-primary" />
          <Link href={WEB_PATHS.USER_PROFILE.replace(':id', id)} passHref>
            <a className="text-footnote">
              {t('profilePage.instructor.viewProfile')}
            </a>
          </Link>
        </div>
      </div>
      <p className="mb-6 text-caption">
        {t('profilePage.instructor.sectionDescription')}
      </p>
      <div className="flex flex-col space-y-6">
        <label className="flex-1 space-y-2">
          <div className="text-caption font-semibold">
            {t('profilePage.instructor.headline')}
          </div>
          <InputSection
            {...fieldShortSummary}
            placeholder={t('profilePage.instructor.shortSummaryPlaceholder')}
          />
        </label>
        <div>
          <p className="mb-2 text-caption font-semibold">
            {t('profilePage.instructor.bio')}
          </p>
          <MarkdownEditor
            onChange={(content, count) => {
              bioHelpers.setValue(content);
              updateCharacterCount(fieldNames.bio, count);
            }}
            value={fieldBio.value}
            maxLength={600}
          />
        </div>
        <div>
          <p className="mb-2 text-caption font-semibold">
            {t('profilePage.instructor.experience')}
          </p>
          <MarkdownEditor
            onChange={(content, count) => {
              experienceHelpers.setValue(content);
              updateCharacterCount(fieldNames.experience, count);
            }}
            value={fieldExperience.value}
            maxLength={600}
          />
        </div>
      </div>
    </section>
  );
};
