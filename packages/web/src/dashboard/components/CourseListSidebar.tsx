import Link from 'next/link';
import cx from 'classnames';
import { useRouter } from 'next/router';
import { useCatalogMenu } from '../../hooks/useCatalogMenu';
import useTranslation from '../../i18n/useTranslation';
import { stringifyUrl } from 'query-string';

interface IListItem {
  id?: string;
  name: string;
}

interface IMenuListProps {
  legend: string;
  items: IListItem[];
  queryName: string;
}

function MenuList({ legend, items, queryName }: IMenuListProps) {
  const router = useRouter();

  return (
    <div className="lg:w-55">
      <div className="my-2 p-4 text-gray-400">{legend}</div>
      <div className="flex flex-col space-y-2">
        {items.map((it, index) => (
          <MenuItem
            key={index}
            id={it.id}
            name={it.name}
            queryName={queryName}
            isCurrent={it.id === router.query[queryName]}
          />
        ))}
      </div>
    </div>
  );
}

interface IMenuItemProps extends IListItem {
  queryName?: string;
  isCurrent?: boolean;
}

function MenuItem({ id, name, queryName, isCurrent = false }: IMenuItemProps) {
  const router = useRouter();
  const url = stringifyUrl({
    url: router.pathname,
    query: {
      [queryName]: id,
      status: router.query.status,
    },
  });
  return (
    <div
      className={cx(
        'rounded-lg border border-transparent hover:border-gray-200 hover:bg-white hover:text-brand-primary',
        {
          'border-gray-200 bg-white text-brand-primary': isCurrent,
          'text-gray-650': !isCurrent,
        },
      )}
    >
      <Link href={url}>
        <a className="block p-4">{name}</a>
      </Link>
    </div>
  );
}

function CourseListSidebar() {
  const { t } = useTranslation();
  const { catalogMenu, isLoading } = useCatalogMenu();
  const router = useRouter();
  const topicId = router.query.topicId as string;
  const learningWayId = router.query.learningWayId as string;
  const showAllTopics = !topicId && !learningWayId;
  return (
    <div className="hidden border-l border-r border-gray-200 bg-gray-100 p-3 text-caption font-semibold lg:flex lg:flex-col">
      {isLoading ? (
        // placeholder
        <div className="lg:w-55" />
      ) : (
        <>
          <MenuItem
            name={t('dashboardCourseListPage.allTopics')}
            isCurrent={showAllTopics}
          />
          {catalogMenu?.learningWays?.length > 0 && (
            <MenuList
              legend={t('dashboardCourseListPage.4LineLearning')}
              items={catalogMenu.learningWays}
              queryName="learningWayId"
            />
          )}
          {catalogMenu?.topics?.length > 0 && (
            <MenuList
              legend={t('dashboardCourseListPage.browseByTopic')}
              items={catalogMenu.topics}
              queryName="topicId"
            />
          )}
        </>
      )}
    </div>
  );
}

export default CourseListSidebar;
