import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiExtraModels, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import {
  ApiBaseResponse,
  BaseResponseDto,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { Connection } from 'typeorm';
import { CatalogMenuService } from './catalog-menu.service';
import { CatalogMenuResponse } from './dto/CatalogMenuResponse.dto';
import { SaveCatalogMenuDto } from './dto/SaveCatalogMenu.dto';

@ApiSecurity('auth_token')
@Controller('/v1/catalog-menu')
@ApiTags('CatalogMenu')
export class CatalogMenuController {
  constructor(
    private menuService: CatalogMenuService,
    private connection: Connection,
  ) {}

  private async getCatalogMenuResponse() {
    const menu = await this.menuService.getMainMenu();
    const response = new BaseResponseDto<CatalogMenuResponse>();
    response.data = new CatalogMenuResponse(menu);
    response.data.topics = menu.menuTopics;
    response.data.learningWays = menu.menuLearningWays;
    return response;
  }

  @Get('/')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBaseResponse(CatalogMenuResponse)
  @ApiExtraModels(CatalogMenuResponse)
  async getCatalogMenu() {
    return this.getCatalogMenuResponse();
  }

  @Post('/')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CatalogMenuController.prototype.saveCatalogMenu),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CATALOG_MENU_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBaseResponse(CatalogMenuResponse)
  @ApiExtraModels(CatalogMenuResponse)
  async saveCatalogMenu(@Body() dto: SaveCatalogMenuDto) {
    await this.connection.transaction((manager) => {
      return this.menuService.withTransaction(manager).saveCatalogMenu(dto);
    });
    return this.getCatalogMenuResponse();
  }
}
