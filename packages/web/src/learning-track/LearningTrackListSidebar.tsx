import cx from 'classnames';
import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';

import { useCatalogMenu } from '../hooks/useCatalogMenu';
import useTranslation from '../i18n/useTranslation';
import CourseListSidebarSkeleton from '../shared/skeletons/CourseListSidebarSkeleton';

interface IListItemProps {
  children: React.ReactNode;
  onClick: () => void;
  hoverStyle?: string;
  activeStyle?: string;
  active?: boolean;
}

function ListItem({
  children,
  onClick,
  hoverStyle,
  activeStyle,
  active,
}: IListItemProps) {
  return (
    <li className="text-caption font-semibold">
      <a
        className={cx(
          'block overflow-hidden rounded-lg border border-transparent p-4',
          hoverStyle ? hoverStyle : 'hover:border-gray-200 hover:bg-gray-100',
          active
            ? activeStyle
              ? activeStyle
              : 'border-gray-200 bg-gray-100'
            : '',
        )}
        onClick={onClick}
      >
        {children}
      </a>
    </li>
  );
}

function reloadPage(router, query) {
  const newUrl = stringifyUrl({
    url: router.pathname,
    query: {
      ...router.routerQuery,
      ...query,
    },
  });

  router.push(newUrl, undefined, { scroll: false });
}

export default function LearningTrackListSidebar() {
  const { catalogMenu, isLoading } = useCatalogMenu();
  const router = useRouter();
  const { t } = useTranslation();

  if (isLoading) return <CourseListSidebarSkeleton />;

  if (!catalogMenu) return null;

  return (
    <div className="hidden flex-1 select-none flex-col lg:flex">
      <ul>
        {catalogMenu.topics
          ? [
              ...[
                { name: t('learningTrackListPage.allTopics'), id: undefined },
              ],
              ...catalogMenu.topics,
            ].map((it, index) => (
              <ListItem
                key={index}
                activeStyle={'text-brand-primary bg-gray-100 border-gray-200'}
                onClick={() => reloadPage(router, { topicId: it.id })}
                active={router.query.topicId === it.id}
              >
                {it.name}
              </ListItem>
            ))
          : null}
      </ul>
    </div>
  );
}
