import React, { FC, useEffect } from 'react';
import useTranslation from '../i18n/useTranslation';
import { Media } from '../models/media';
import InputSection from '../ui-kit/InputSection';
import { useCourseOutlinePlaylist } from './useCourseOutlinePlaylist';
import { TableColumn, TableHead } from '../ui-kit/Table';
import { format, parseISO } from 'date-fns';
import Button from '../ui-kit/Button';
import { usePlaylist } from '../hooks/usePlaylist';
import { remove } from 'lodash';

export interface ICourseOutlinePlaylist {
  medias: Media[];
  onChange: (medias: Media[]) => any;
}

export const CourseOutlinePlaylist: FC<ICourseOutlinePlaylist> = (props) => {
  const { medias, onChange } = props;
  const { t } = useTranslation();
  const { handleOnChangeSearchQuery, medias: mediaResult } =
    useCourseOutlinePlaylist();
  const playlist = usePlaylist(medias);

  useEffect(() => {
    handleOnChangeSearchQuery({ target: { value: '' } } as any);
  }, []);

  function excludeResult(sources: Media[]) {
    const ids = sources.map((src) => src.id);
    const clone = [...mediaResult];
    remove(clone, (m: Media) => ids.includes(m.id));

    return clone;
  }

  function tableFromMedia(
    sources: Media[],
    actionColumn: (media: Media, index: number) => React.ReactNode,
  ) {
    return (
      <table className="w-full table-auto border-collapse border text-left">
        <thead>
          <tr>
            <TableHead className="w-1/16">#</TableHead>
            <TableHead className="w-1/6">Title</TableHead>
            <TableHead className="w-1/6">File name</TableHead>
            <TableHead className="w-1/6">Duration (seconds)</TableHead>
            <TableHead className="w-1/6">Last modified</TableHead>
            <TableHead className="w-1/6">Status</TableHead>
            <TableHead className="w-1/6">Action</TableHead>
          </tr>
        </thead>
        <tbody className="w-full">
          {sources.map((media, index) => (
            <tr key={media.id} className="hover:bg-gray-100">
              <TableColumn>{index}</TableColumn>
              <TableColumn>{media.title}</TableColumn>
              <TableColumn>{media.filename}</TableColumn>
              <TableColumn>{media.duration}</TableColumn>
              <TableColumn>
                {format(parseISO(media.updatedAt), 'dd/MM/yyyy HH:mm:ss')}
              </TableColumn>
              <TableColumn>{media.status}</TableColumn>
              <TableColumn>{actionColumn(media, index)}</TableColumn>
            </tr>
          ))}
          {sources.length <= 0 && (
            <tr className="text-center hover:bg-gray-100">
              <TableColumn colSpan={4}>No records found!</TableColumn>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  return (
    <>
      {tableFromMedia(medias, (media: Media, index) => (
        <div className="space-y-4">
          <Button
            type="button"
            variant="primary"
            size="medium"
            onClick={() => onChange(playlist.stepUp(index))}
          >
            Up
          </Button>
          <Button
            type="button"
            variant="primary"
            size="medium"
            onClick={() => onChange(playlist.stepDown(index))}
          >
            Down
          </Button>
          <Button
            type="button"
            variant="primary"
            size="medium"
            onClick={() => onChange(playlist.remove(index))}
          >
            Remove
          </Button>
        </div>
      ))}
      <div className="my-4" />
      <InputSection
        name="searchQuery"
        onChange={handleOnChangeSearchQuery}
        placeholder={t('courseOutlineForm.searchMedia')}
      />
      {tableFromMedia(excludeResult(medias), (media: Media) => (
        <Button
          type="button"
          variant="primary"
          size="medium"
          onClick={() => onChange(playlist.add(media))}
        >
          Add
        </Button>
      ))}
    </>
  );
};
