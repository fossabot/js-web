import cx from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';

import WEB_PATHS from '../../constants/webPaths';
import { getLanguageValue } from '../../i18n/lang-utils';
import { LearningWayKey } from '../../models/learning-way';
import { useCatalogMenu } from '../../hooks/useCatalogMenu';
import CourseListSidebarSkeleton from '../../shared/skeletons/CourseListSidebarSkeleton';

const learningWayStyles = {
  [LearningWayKey.ONLINE]: {
    active: 'bg-learning-online-100 text-learning-online-200',
    hover: 'hover:bg-learning-online-100 hover:text-learning-online-200',
  },
  [LearningWayKey.INLINE]: {
    active: 'bg-learning-inline-100 text-learning-inline-200',
    hover: 'hover:bg-learning-inline-100 hover:text-learning-inline-200',
  },
  [LearningWayKey.BEELINE]: {
    active: 'bg-learning-beeline-100 text-learning-beeline-200',
    hover: 'hover:bg-learning-beeline-100 hover:text-learning-beeline-200',
  },
  [LearningWayKey.FRONTLINE]: {
    active: 'bg-learning-frontline-100 text-learning-frontline-200',
    hover: 'hover:bg-learning-frontline-100 hover:text-learning-frontline-200',
  },
};

function Headline({ children }) {
  return (
    <h4 className="p-4 text-caption font-semibold text-gray-400">{children}</h4>
  );
}

interface IListItemProps {
  children: React.ReactNode;
  href: string;
  hoverStyle?: string;
  activeStyle?: string;
  active?: boolean;
}

function ListItem({
  children,
  href,
  hoverStyle,
  activeStyle,
  active,
}: IListItemProps) {
  return (
    <li className="text-caption font-semibold">
      <Link href={href}>
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
        >
          {children}
        </a>
      </Link>
    </li>
  );
}

export default function CourseListSidebar() {
  const { catalogMenu, isLoading } = useCatalogMenu();
  const router = useRouter();
  const currentId = router.query.id;

  if (isLoading) return <CourseListSidebarSkeleton />;

  if (!catalogMenu) return null;

  return (
    <div className="hidden flex-1 select-none flex-col lg:flex">
      <Headline>{getLanguageValue(catalogMenu.learningWayHeadline)}</Headline>
      <ul>
        {catalogMenu.learningWays?.map((it, index) => (
          <ListItem
            key={index}
            href={WEB_PATHS.CATALOG_LEARNING_WAYS + '/' + it.id}
            hoverStyle={learningWayStyles[it.key]?.hover}
            activeStyle={learningWayStyles[it.key]?.active}
            active={currentId === it.id}
          >
            {it.name}
          </ListItem>
        ))}
      </ul>
      <Headline>{getLanguageValue(catalogMenu.topicHeadline)}</Headline>
      <ul>
        {catalogMenu.topics?.map((it, index) => (
          <ListItem
            key={index}
            activeStyle={'text-brand-primary bg-gray-100 border-gray-200'}
            href={WEB_PATHS.CATALOG_TOPICS + '/' + it.id}
            active={router.query.id === it.id}
          >
            {it.name}
          </ListItem>
        ))}
      </ul>
    </div>
  );
}
