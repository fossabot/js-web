import cx from 'classnames';

interface IVideoPlayerProps {
  showOutline: boolean;
}

function VideoPlayer({ showOutline }: IVideoPlayerProps) {
  return (
    <div
      className={cx(
        'w-full bg-black lg:order-1',
        showOutline && 'hidden lg:block',
      )}
    >
      <div className="min-h-52 lg:mx-auto lg:max-w-299">
        <div id="video-player"></div>
      </div>
    </div>
  );
}

export default VideoPlayer;
