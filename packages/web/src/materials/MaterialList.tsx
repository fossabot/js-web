import { FC } from 'react';
import Pagination from '../ui-kit/Pagination';
import { TableColumn, TableHead } from '../ui-kit/Table';
import {
  BaseMaterial,
  MaterialExternal,
  MaterialInternal,
  MaterialType,
} from '../models/baseMaterial';
import Button from '../ui-kit/Button';
import { FaDownload, FaEdit, FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import bytes from 'bytes';
import mime from 'mime';
import { format, parseISO } from 'date-fns';
import WEB_PATHS from '../constants/webPaths';

export interface IMaterialList {
  materials: BaseMaterial[];
  totalPages: number;
  onDownload: (material: BaseMaterial) => void;
  onDelete: (material: BaseMaterial) => void;
}

export const MaterialList: FC<IMaterialList> = (props) => {
  const { materials, totalPages, onDownload, onDelete } = props;

  return (
    <>
      <div className="my-4 overflow-x-scroll rounded bg-white shadow-md">
        <table className="w-full table-auto border-collapse border text-left">
          <thead>
            <tr>
              <TableHead>Type</TableHead>
              <TableHead>Display name</TableHead>
              <TableHead>File name</TableHead>
              <TableHead>Extension</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="w-1/6">Created at</TableHead>
              <TableHead>Created by</TableHead>
              <TableHead className="w-1/8">Edit</TableHead>
              <TableHead className="w-1/8">Download</TableHead>
              <TableHead className="w-1/8">Delete</TableHead>
            </tr>
          </thead>
          <tbody className="w-full">
            {materials.map((material) => (
              <tr key={material.id} className="hover:bg-gray-100">
                <TableColumn>{material.type}</TableColumn>
                <TableColumn>
                  {material.type === MaterialType.MATERIAL_INTERNAL &&
                    material.displayName}
                  {material.type === MaterialType.MATERIAL_EXTERNAL && (
                    <a href={(material as MaterialExternal).url} target="blank">
                      {material.displayName}
                    </a>
                  )}
                </TableColumn>
                <TableColumn>
                  {(material as MaterialInternal).filename}
                </TableColumn>
                <TableColumn>
                  {material.type === MaterialType.MATERIAL_INTERNAL &&
                    mime.getExtension((material as MaterialInternal).mime)}
                </TableColumn>
                <TableColumn>
                  {material.type === MaterialType.MATERIAL_INTERNAL &&
                    bytes((material as MaterialInternal).bytes, {
                      unitSeparator: ' ',
                    })}
                </TableColumn>
                <TableColumn>
                  {format(parseISO(material.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                </TableColumn>
                <TableColumn>{material.uploader.email}</TableColumn>
                <TableColumn>
                  <Link
                    href={WEB_PATHS.MATERIALS_DETAIL.replace(
                      ':id',
                      material.id,
                    )}
                  >
                    <a>
                      <Button variant="primary" size="medium" type="button">
                        <FaEdit />
                      </Button>
                    </a>
                  </Link>
                </TableColumn>
                <TableColumn>
                  {material.type === MaterialType.MATERIAL_INTERNAL && (
                    <Button
                      variant="primary"
                      size="medium"
                      type="button"
                      onClick={() => onDownload(material)}
                    >
                      <FaDownload />
                    </Button>
                  )}
                </TableColumn>
                <TableColumn>
                  <Button
                    variant="primary"
                    size="medium"
                    type="button"
                    onClick={() => onDelete(material)}
                  >
                    <FaTrash />
                  </Button>
                </TableColumn>
              </tr>
            ))}
            {materials.length <= 0 && (
              <tr className="text-center hover:bg-gray-100">
                <TableColumn colSpan={4}>No records found!</TableColumn>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 0 && <Pagination totalPages={totalPages} />}
    </>
  );
};
