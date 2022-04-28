import React, { useMemo, useRef } from 'react';
import Link from 'next/link';
import cx from 'classnames';
import { useState } from 'react';
import { useEffect } from 'react';
import WEB_PATHS from '../../constants/webPaths';
import { getLanguageValue } from '../../i18n/lang-utils';
import useTranslation from '../../i18n/useTranslation';
import ArrowLeft from '../icons/ArrowLeft';
import { LearningWayKey } from '../../models/learning-way';
import { useCatalogMenu } from '../../hooks/useCatalogMenu';

const TOPICS_LIMIT = 15;
const TOPICS_MOBILE_LIMIT = 5;
const LEARNING_WAYS_LIMIT = 4;

const learningWayStyles = {
  [LearningWayKey.BEELINE]: {
    backgroundColor: '#ED9716',
    backgroundImage: 'url(/assets/learning-ways/beeline.svg)',
  },
  [LearningWayKey.FRONTLINE]: {
    backgroundColor: '#A80030',
    backgroundImage: 'url(/assets/learning-ways/frontline.svg)',
  },
  [LearningWayKey.ONLINE]: {
    backgroundColor: '#2274A5',
    backgroundImage: 'url(/assets/learning-ways/online.svg)',
  },
  [LearningWayKey.INLINE]: {
    backgroundColor: '#436436',
    backgroundImage: 'url(/assets/learning-ways/inline.svg)',
  },
};

interface ICatalogMenu {
  show: boolean;
  menuItemRef: React.MutableRefObject<any>;
  onClose: () => void;
  showMobileMenu: boolean;
}

interface IMenuItem {
  onClick: () => void;
  children: React.ReactNode;
}

interface ILearningLineItem {
  title: string;
  description: string;
  href: string;
  learningWayKey: string;
  onClick: () => void;
}

const MenuItem: React.FunctionComponent<IMenuItem> = ({
  children,
  onClick,
}) => {
  return (
    <li
      className="text-caption font-semibold line-clamp-2 lg:w-1/2 lg:flex-shrink-0"
      onClick={onClick}
    >
      {children}
    </li>
  );
};

const LearningLineItem: React.FunctionComponent<ILearningLineItem> = ({
  title,
  description,
  href,
  learningWayKey,
  onClick,
}) => {
  return (
    <li
      className="m-4 rounded-2xl bg-gray-600 bg-right-top bg-no-repeat text-white lg:mx-10 lg:w-80"
      style={learningWayStyles[learningWayKey]}
      onClick={onClick}
    >
      <Link href={href}>
        <a className="block p-4">
          <h5 className="mb-1 text-subheading font-bold">{title}</h5>
          <div className="h-10 text-caption font-normal line-clamp-2">
            {description}
          </div>
        </a>
      </Link>
    </li>
  );
};

const CatalogMenu: React.FunctionComponent<ICatalogMenu> = ({
  show,
  onClose,
  menuItemRef,
  showMobileMenu,
}) => {
  const { catalogMenu } = useCatalogMenu();
  const [topics, setTopics] = useState([]);
  const [learningWays, setLearningWays] = useState([]);
  const [showAllTopics, setShowAllTopics] = useState(true);
  const { t } = useTranslation();
  const wrapperRef = useRef(null);

  async function sliceMenuItems() {
    setTopics(catalogMenu.topics.slice(0, TOPICS_LIMIT));
    setLearningWays(catalogMenu.learningWays.slice(0, LEARNING_WAYS_LIMIT));
  }

  function handleClickOutside(event) {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target) &&
      menuItemRef.current &&
      !menuItemRef.current.contains(event.target)
    ) {
      event.preventDefault();
      onClose();
    }
  }

  useEffect(() => {
    if (catalogMenu) {
      sliceMenuItems();
    }
  }, [catalogMenu]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  });

  useEffect(() => {
    if (showMobileMenu) {
      setShowAllTopics(false);
    }
  }, [showMobileMenu]);

  const topicList = useMemo(() => {
    const remainTopicLength = topics.length - TOPICS_MOBILE_LIMIT;
    const displayTopics =
      !showMobileMenu || (showMobileMenu && showAllTopics)
        ? topics
        : topics.slice(0, TOPICS_MOBILE_LIMIT);
    return (
      <>
        <ul className="w-full text-caption font-semibold text-black lg:flex lg:flex-wrap">
          {displayTopics.map((item, index) => (
            <MenuItem key={index} onClick={() => onClose()}>
              <Link href={`${WEB_PATHS.CATALOG_TOPICS}/${item.id}`}>
                <a className="block px-6 py-4 lg:rounded-xl lg:hover:bg-gray-200">
                  {item.name}
                </a>
              </Link>
            </MenuItem>
          ))}
        </ul>
        {!showAllTopics && remainTopicLength > 0 && (
          <div
            className="cursor-pointer px-6 py-4 text-brand-primary lg:mx-4 lg:px-2"
            onClick={() => setShowAllTopics(true)}
          >
            {t('catalogMenu.seeAllTopics', { remainTopicLength })}
          </div>
        )}
      </>
    );
  }, [topics, showAllTopics]);

  const learningWayList = useMemo(() => {
    if (learningWays && learningWays.length) {
      return (
        <ul className="pb-20 text-black lg:pb-10">
          {learningWays.map((item, index) => (
            <LearningLineItem
              key={index}
              title={item.name}
              href={WEB_PATHS.CATALOG_LEARNING_WAYS + '/' + item.id}
              description={item.description}
              learningWayKey={item.key}
              onClick={() => onClose()}
            ></LearningLineItem>
          ))}
        </ul>
      );
    } else {
      return [];
    }
  }, [learningWays]);

  return (
    <div
      ref={wrapperRef}
      className={cx(
        'h-screen w-full flex-col bg-white text-caption text-black lg:h-auto lg:w-auto lg:flex-row lg:items-center',
        'absolute top-0 left-0 right-0 z-20 cursor-default lg:top-full lg:right-auto lg:mt-5 lg:-ml-6',
        'lg:overflow-hidden lg:rounded-b-2xl lg:border lg:border-gray-200 lg:shadow-md',
        show ? 'flex' : 'hidden',
      )}
    >
      <div
        className="sticky flex items-center px-6 py-4 text-body font-semibold lg:hidden"
        onClick={onClose}
      >
        <ArrowLeft className="mr-5" /> {t('catalogMenu.back')}
      </div>
      <div className="overflow-y-scroll lg:flex lg:overflow-y-auto">
        {!!catalogMenu && (
          <>
            <div className="pb-4 lg:w-136 lg:px-3">
              <h4 className="px-6 py-4 text-subheading font-bold line-clamp-2 lg:pt-10">
                {getLanguageValue(catalogMenu.topicHeadline)}
              </h4>
              {topicList}
            </div>
            <div className="border-t border-gray-200 bg-gray-100 lg:border-t-0 lg:border-l">
              <h4 className="px-6 pt-4 pb-2 text-subheading font-bold line-clamp-2 lg:px-10 lg:pt-10">
                {getLanguageValue(catalogMenu.learningWayHeadline)}
              </h4>
              {learningWayList}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CatalogMenu;
