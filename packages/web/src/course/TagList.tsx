import Link from 'next/link';

interface IProps {
  title: string;
  tags: {
    title: string;
    url?: string;
  }[];
}

export const TagList: React.FC<IProps> = ({ title, tags }) => {
  return (
    <div className="mb-4 w-full">
      <p className="mb-2 w-full text-left text-caption font-bold">{title}</p>
      <div className="-ml-1 -mt-1 flex w-full flex-wrap items-center">
        {tags.map((tag, idx) => (
          <Link key={`${idx}-${tag.title}-${tag.url}`} href={tag.url} passHref>
            <a className="m-1 rounded-md bg-gray-300 py-1 px-2 text-footnote">
              {tag.title}
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};
