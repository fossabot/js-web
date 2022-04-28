import cx from 'classnames';
import ContentLineClampStyle from '../ui-kit/ContentLineClamp/contentLineClamp.module.css';

interface IProps {
  title: string;
  content?: string;
}

const CourseDetailMarkdownWithTitle: React.FC<IProps> = ({
  title,
  content,
}): JSX.Element | null => {
  if (!content) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold">{title}</h3>
      <div
        className={cx('pl-4 pt-4', ContentLineClampStyle.rte)}
        dangerouslySetInnerHTML={{
          __html: content,
        }}
      ></div>
    </div>
  );
};

export default CourseDetailMarkdownWithTitle;
