/* eslint-disable max-classes-per-file */

import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { DEFAULT_PAGE_LIMIT } from '../utils/constants';
import { BaseQueryDto } from './BaseQuery.dto';

export class PaginationParamsDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  perPage: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}

export class BaseResponseDto<T> {
  data?: T;

  @ApiProperty({ required: false })
  pagination?: PaginationParamsDto;

  @ApiProperty({ required: false })
  code?: string;

  @ApiProperty({
    required: false,
    oneOf: [
      { type: 'string' },
      {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    ],
  })
  message?: string | Array<string>;
}

export const getPaginationResponseParams = (
  query: Partial<BaseQueryDto>,
  total: number,
): PaginationParamsDto => {
  return {
    perPage: query.perPage || DEFAULT_PAGE_LIMIT,
    page: query.page || 1,
    total: total || 0,
    totalPages: Math.ceil(
      Number(total) / (query.perPage || DEFAULT_PAGE_LIMIT),
    ),
  };
};

export const getPaginationRequestParams = (query: Partial<BaseQueryDto>) => {
  const take = query.perPage || DEFAULT_PAGE_LIMIT;
  const page = query.page || 1;
  const skip = page > 1 ? take * (page - 1) : 0;
  return { skip, take };
};

export const getSearchRequestParams = (query: BaseQueryDto) => {
  const search = (query.search || '').trim();
  const searchField = (query.searchField || '').trim();

  return { search, searchField };
};

export const getSortRequestParams = (
  query: BaseQueryDto,
): { orderBy: string; order: 'ASC' | 'DESC' } => {
  const orderString = (query.order || '').trim().toUpperCase();

  const orderBy = query.orderBy || 'createdAt';
  const order: 'ASC' | 'DESC' = orderString === 'ASC' ? 'ASC' : 'DESC';

  return { orderBy, order };
};

export interface IListParams {
  skip: number;
  take: number;
  search: string;
  searchField: string;
  order: 'ASC' | 'DESC';
  orderBy: string;
}

export const ApiBaseResponse = <TModel extends Type<any>>(
  model: TModel,
  options: { pagination?: boolean; array?: boolean } = {
    pagination: false,
    array: false,
  },
) => {
  const allOf: (SchemaObject | ReferenceObject)[] = [];

  if (options.pagination || options.array) {
    if (options.pagination) {
      allOf.push({
        required: ['pagination'],
        properties: {
          pagination: { $ref: getSchemaPath(PaginationParamsDto) },
        },
      });
    }

    allOf.push({
      required: ['data'],
      properties: {
        data: { type: 'array', items: { $ref: getSchemaPath(model) } },
      },
    });
  } else {
    allOf.push({
      required: ['data'],
      properties: {
        data: { $ref: getSchemaPath(model) },
      },
    });
  }

  return applyDecorators(
    ApiOkResponse({
      schema: { allOf },
    }),
    ApiExtraModels(model),
  );
};
