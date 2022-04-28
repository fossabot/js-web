import { useEffect, useMemo, useRef, useState } from 'react';
import useTranslation from '../i18n/useTranslation';
import Head from 'next/head';
import Layout from '../layouts/main.layout';
import MainNavbar from '../ui-kit/headers/MainNavbar';
import { useRouter } from 'next/router';
import { ICourseDetail } from '../models/course';
import API_PATHS from '../constants/apiPaths';
import { centralHttp } from '../http';
import VideoCaption from './components/VideoCaption';
import VideoNavigation from './components/VideoNavigation';
import ChapterDetail from './components/ChapterDetail';
import CourseDetail from './components/CourseDetail';
import VideoPlayer from './components/VideoPlayer';
import { MediaExtended } from '../models/media';
import { useJWPlayer } from '../hooks/useJWPlayer';
import { JWPlayerScript } from '../ui-kit/JWPlayerScript';
import VideoPlaylist from './components/VideoPlaylist';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import WEB_PATHS from '../constants/webPaths';
import { useResponsive } from '../hooks/useResponsive';
import CourseApi from '../http/course.api';
import { stringifyUrl } from 'query-string';
import { ERROR_CODES } from '../constants/errors';

const playerElementId = 'video-player';
const PROGRESS_UPDATE_INTERVAL = 15000;
const AUTO_REDIRECT_INTERVAL = 3000;

function CourseVideoPage({ token }) {
  const { t } = useTranslation();
  const { lg } = useResponsive();
  const router = useRouter();
  const [showOutline, setShowOutline] = useState(lg);
  const [course, setCourse] = useState<ICourseDetail<string>>(undefined);
  const [mediaList, setMediaList] = useState<MediaExtended[]>([]);
  const [mediaIndex, setMediaIndex] = useState<number>(-1);
  const [jwPlaylistUrl, setJWPlaylistUrl] = useState<string>('');
  const playerIntervalRef = useRef<number>();

  const courseId = router.query.id as string;
  const videoId = router.query.videoId as string;

  const currentMedia = useMemo(
    () => (mediaList?.length && mediaIndex > -1 ? mediaList[mediaIndex] : null),
    [mediaList?.length, mediaIndex],
  );

  async function verifyAccess(courseId: string) {
    try {
      await centralHttp.post(
        API_PATHS.COURSE_VALIDATE_PLAN.replace(':id', courseId),
      );
      return true;
    } catch (err) {
      // redirect to course detail page with special query to fetch plan
      if (err?.response?.data?.code === ERROR_CODES.INVALID_SUBSCRIPTION.code) {
        router.push(
          stringifyUrl({
            url: WEB_PATHS.COURSE_DETAIL.replace(':id', courseId as string),
            query: {
              needPlanId: err?.response?.data?.data?.cheapestPlan.id,
              canUpgrade: err?.response?.data?.data?.canUpgrade,
            },
          }),
        );
      }
      return false;
    }
  }

  async function fetchCourseDetail(courseId: string) {
    const { data } = await centralHttp.get<
      BaseResponseDto<ICourseDetail<string>>
    >(API_PATHS.COURSE_DETAIL.replace(':id', courseId));
    if (!data?.data) {
      redirectToNotFound();
    } else {
      setCourse(data?.data);
    }
  }

  async function fetchAllCourseMedia(courseId: string) {
    const videos = await CourseApi.getAllVideos(courseId);
    setMediaList(videos);
  }

  async function getVideoSignedUrl(media: MediaExtended) {
    const { data } = await centralHttp.get<BaseResponseDto<string>>(
      API_PATHS.MEDIA_ID_SIGNED_URL.replace(':id', media.id),
    );
    setJWPlaylistUrl(data?.data);
  }

  function onToggleShowOutline() {
    setShowOutline(!showOutline);
  }

  function setupJWPlayerInstance(jwPlaylistUrl: string) {
    if (!window.jwplayer) return;

    const instance = window.jwplayer(playerElementId);
    if (instance) {
      const config = instance.getConfig();
      instance.setup({
        ...config,
        playlist: jwPlaylistUrl,
      });
      instance.on('play', onVideoPlay);
      instance.on('pause', onVideoStop);
      instance.on('complete', onVideoEnded);
      instance.on('playlist', onLoadPlaylist);
    }
  }

  function onLoadPlaylist() {
    if (!this || !currentMedia) return;

    if (currentMedia.percentage >= 100) {
      this.seek(0);
    } else {
      this.seek(currentMedia.spentDuration);
    }
    this.play();
  }

  function onVideoPlay() {
    updateLearningProgress();

    clearProgressTrackingInterval();
    playerIntervalRef.current = window.setInterval(
      updateLearningProgress,
      PROGRESS_UPDATE_INTERVAL,
    );
  }

  function onVideoStop() {
    clearProgressTrackingInterval();
    updateLearningProgress();
  }

  function onVideoEnded() {
    onVideoStop();
    if (mediaIndex < mediaList.length - 1) {
      const videoId = mediaList[mediaIndex + 1].id;
      const url = WEB_PATHS.COURSE_VIDEO_PLAYER.replace(
        ':id',
        courseId,
      ).replace(':videoId', videoId);
      setTimeout(() => {
        router.push(url);
      }, AUTO_REDIRECT_INTERVAL);
    }
  }

  function clearProgressTrackingInterval() {
    window.clearInterval(playerIntervalRef.current);
  }

  function updateLearningProgress() {
    if (mediaList[mediaIndex].percentage >= 100) return;

    if (!window.jwplayer) return;

    const instance = window.jwplayer(playerElementId);
    const spentDuration = instance.getPosition();
    CourseApi.updateVideoProgress(
      currentMedia.courseOutlineId,
      currentMedia.id,
      spentDuration,
    );

    let percentage = Math.round((spentDuration / currentMedia.duration) * 100);
    if (percentage > 100) percentage = 100;

    if (percentage > mediaList[mediaIndex].percentage) {
      const newMediaList = [...mediaList];

      newMediaList[mediaIndex] = {
        ...newMediaList[mediaIndex],
        spentDuration,
        percentage,
      };

      setMediaList(newMediaList);
    }
  }

  function verifyShowOutline() {
    if (!lg) {
      setShowOutline(false);
    }
  }

  function redirectBackToCourse() {
    router.replace(WEB_PATHS.COURSE_DETAIL.replace(':id', courseId));
  }

  function redirectToNotFound() {
    router.replace('/404');
  }

  const { init: JWPlayerInit } = useJWPlayer(playerElementId, currentMedia, {
    onPlay: onVideoPlay,
    onPause: onVideoStop,
    onComplete: onVideoEnded,
    onPlaylist: onLoadPlaylist,
  });

  useEffect(() => {
    if (courseId) {
      verifyAccess(courseId).then((allowed) => {
        if (allowed) {
          fetchCourseDetail(courseId);
          fetchAllCourseMedia(courseId);
        }
      });
    }
  }, [courseId]);

  useEffect(() => {
    if (mediaList?.length) {
      const media = !videoId
        ? mediaList[0]
        : mediaList.find((m) => m.id === videoId);

      if (media) {
        setMediaIndex(mediaList.indexOf(media));
        getVideoSignedUrl(media);
        verifyShowOutline();
        clearProgressTrackingInterval();
      } else {
        redirectBackToCourse();
      }
    }
  }, [mediaList?.length, videoId]);

  useEffect(() => {
    if (jwPlaylistUrl) {
      setupJWPlayerInstance(jwPlaylistUrl);
    }
  }, [jwPlaylistUrl]);

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {currentMedia?.title}
        </title>
      </Head>
    ),
    [currentMedia?.id],
  );

  const isEnrolled = useMemo(
    () => course?.userEnrolledCourse?.length > 0,
    [course?.id],
  );

  const navigation = useMemo(
    () => (
      <VideoNavigation
        courseId={courseId}
        mediaList={mediaList}
        mediaIndex={mediaIndex}
        currentMedia={currentMedia}
        showOutline={showOutline}
        onToggleShowOutline={onToggleShowOutline}
      />
    ),
    [courseId, mediaList, mediaIndex, currentMedia, showOutline],
  );

  const videoPlaylist = useMemo(
    () => (
      <VideoPlaylist
        courseId={courseId}
        mediaList={mediaList}
        mediaIndex={mediaIndex}
        show={showOutline}
        onClickPlaylistItem={() => verifyShowOutline()}
      />
    ),
    [courseId, mediaList, mediaIndex, showOutline],
  );

  if (!course || !currentMedia) return null;

  return (
    <Layout
      head={head}
      header={<MainNavbar token={token} theme="dark" />}
      noMobilePadding={true}
      topContent={<div className="hidden w-full lg:block">{navigation}</div>}
      leftContent={<div className="hidden lg:block">{videoPlaylist}</div>}
    >
      <JWPlayerScript onLoad={JWPlayerInit} />
      <div className="flex flex-col lg:relative lg:overflow-hidden">
        <div className="flex w-full flex-col items-center">
          <VideoPlayer showOutline={showOutline} />
          <VideoCaption
            title={currentMedia?.title}
            duration={currentMedia?.duration}
            mediaIndex={mediaIndex}
            showOutline={showOutline}
            percentage={currentMedia?.percentage}
          />
          <div className="w-full lg:hidden">
            {navigation}
            {videoPlaylist}
          </div>
        </div>
        <ChapterDetail media={currentMedia} />
        <CourseDetail
          course={course}
          lessonLength={mediaList.length}
          isEnrolled={isEnrolled}
        />
      </div>
    </Layout>
  );
}

export default CourseVideoPage;
