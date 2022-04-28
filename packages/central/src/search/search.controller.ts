import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import IRequestWithUser from '@seaccentral/core/dist/user/IRequestWithUser';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { UserSearchHistory } from '@seaccentral/core/dist/search/UserSearchHistory.entity';

import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/SearchQuery.dto';
import { SearchHistoryBody } from './dto/SearchHistoryBody.dto';

@Controller('v1/search')
@ApiTags('Search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('')
  async searchCourses(
    @Query() query: SearchQueryDto,
    @Req() req: IRequestWithUser,
  ) {
    const { skip, take } = getPaginationRequestParams(query);
    const { result, totalRecords } = await this.searchService.search({
      query,
      skip,
      take,
      user: req.user,
    });
    const response = new BaseResponseDto<any>();

    response.data = result;
    response.pagination = getPaginationResponseParams(query, totalRecords);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/suggest')
  async search(
    @Query() query: { term: string },
    @Headers('accept-language') acceptLanguage: LanguageCode,
    @Req() req: IRequestWithUser,
  ) {
    const terms = await this.searchService.suggestTerms(
      query.term,
      acceptLanguage,
      req.user,
    );

    return terms;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/histories/me')
  async getMySearchHistories(@Req() req: IRequestWithUser) {
    const response = new BaseResponseDto<UserSearchHistory[]>();
    response.data = await this.searchService.findMyRecentHistories(req.user);

    return response;
  }

  @Post('/histories/me')
  @UseGuards(JwtAuthGuard)
  async addMySearchHistory(
    @Body() searchHistoryBody: SearchHistoryBody,
    @Req() req: IRequestWithUser,
  ) {
    await this.searchService.addMyHistory(searchHistoryBody, req.user);
  }
}
