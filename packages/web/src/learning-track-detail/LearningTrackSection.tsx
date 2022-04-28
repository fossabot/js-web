import { BurgerMenu } from '../ui-kit/icons';
import useTranslation from '../i18n/useTranslation';
import { ILearningTrackDetail } from '../models/learningTrack';
import LearningTrackSectionItem from './LearningTrackSectionItem';

export default function LearningTrackSection({
  learningTrackDetail,
}: {
  learningTrackDetail: ILearningTrackDetail;
}) {
  const { t } = useTranslation();
  const header = (
    <h3 className="mt-4 mb-6 flex items-center text-heading font-semibold text-black">
      <BurgerMenu className="mr-2 inline h-6 w-6" />
      {t('learningTrackDetailPage.outline')}
    </h3>
  );

  return (
    <>
      {header}
      <div className="-mx-6 bg-gray-200 lg:-mx-0 lg:bg-white">
        {learningTrackDetail.learningTrackSections.map((section, index) => (
          <LearningTrackSectionItem
            key={section.id}
            section={section}
            index={index}
            learningTrackDetail={learningTrackDetail}
          />
        ))}
      </div>
    </>
  );
}
