import Link from 'next/link';
import { useEffect, useState } from 'react';
import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';
import { Topic } from '../../models/topic';

interface ISubTopicButtonProps {
  id?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

function SubTopicButton({ id, children, onClick }: ISubTopicButtonProps) {
  return (
    <li className="mb-4 mr-4" onClick={onClick}>
      {id ? (
        <Link href={`${WEB_PATHS.CATALOG_TOPICS}/${id}`}>
          <a className="block rounded-md border border-gray-300 bg-gray-100 px-6 py-2 text-caption font-semibold hover:border-gray-600">
            {children}
          </a>
        </Link>
      ) : (
        <div className="block cursor-pointer rounded-md border border-gray-300 bg-gray-100 px-6 py-2 text-caption font-semibold hover:border-gray-600">
          {children}
        </div>
      )}
    </li>
  );
}

interface ISubTopicListProps {
  topics: Topic[];
  maxSubTopics: number;
}

export default function SubTopicList({
  topics,
  maxSubTopics,
}: ISubTopicListProps) {
  const { t } = useTranslation();

  const [visibleTopics, setVisibleTopics] = useState<Topic[]>([]);
  const [expanded, setExpanded] = useState(false);

  function handleClickExpand() {
    setExpanded(true);
  }

  useEffect(() => {
    if (!topics) {
      setExpanded(false);
    } else if (topics.length) {
      if (!expanded && topics.length > maxSubTopics) {
        setVisibleTopics(topics.slice(0, maxSubTopics));
      } else {
        setVisibleTopics([...topics]);
      }
    }
  }, [topics, expanded]);

  if (!topics || !topics.length) return null;

  return (
    <ul className="mt-6 mb-2 flex w-full select-none flex-wrap lg:mb-6">
      {visibleTopics.map((topic, index) => (
        <SubTopicButton id={topic.id} key={index}>
          {topic.name}
        </SubTopicButton>
      ))}
      {visibleTopics?.length !== topics.length ? (
        <SubTopicButton onClick={handleClickExpand}>
          {t('catalogList.more', {
            number: topics.length - visibleTopics.length,
          })}
        </SubTopicButton>
      ) : null}
    </ul>
  );
}
