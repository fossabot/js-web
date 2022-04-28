import {
  Req,
  Query,
  Controller,
  Put,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Connection } from 'typeorm';
import { ApiBody, ApiTags, ApiQuery } from '@nestjs/swagger';

import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import {
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
  getSearchRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { SYSTEM_ROLES } from '@seaccentral/core/dist/utils/constants';
import { UserEmails } from '@seaccentral/core/dist/dto/UserEmails.dto';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { UserIdentifiers } from '@seaccentral/core/dist/dto/UserIdentifiers.dto';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import { UserUploadFileDto } from '@seaccentral/core/dist/dto/UserUploadFile.dto';
import { UserUploadHistoryDto } from '@seaccentral/core/dist/dto/UserUploadHistory.dto';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';

import { UserRole } from './dto/UserRole.dto';
import { AdminService } from './admin.service';
import { UserQueryDto } from './dto/UserQuery.dto';
import { GetAllUsers } from './dto/GetAllUsers.dto';
import { QueryFileKey } from './dto/QueryFileKey.dto';
import { SearchService } from '../search/search.service';
import { LoginSettingDto } from './dto/LoginSetting.dto';
import { PasswordSettingDto } from './dto/PasswordSetting.dto';
import IRequestWithUser from '../invitation/interface/IRequestWithUser';
import { UserManagementResponse } from './dto/UserManagementResponse.dto';

@Controller('v1/admin')
@ApiTags('Admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UsersService,
    private readonly connection: Connection,
    private readonly searchService: SearchService,
  ) {}

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(AdminController.prototype.getLoginSetting),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
    BACKEND_ADMIN_CONTROL.ACCESS_LOGIN_SETTINGS,
  )
  @Get('setting/login')
  async getLoginSetting(): Promise<BaseResponseDto<LoginSettingDto>> {
    const response = new BaseResponseDto<LoginSettingDto>();
    response.data = await this.adminService.findLoginSetting();
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(AdminController.prototype.updateLoginSetting),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
    BACKEND_ADMIN_CONTROL.ACCESS_LOGIN_SETTINGS,
  )
  @Put('setting/login/:id')
  updateLoginSetting(
    @Param('id') id: string,
    @Body() loginSetting: LoginSettingDto,
  ): Promise<LoginSettingDto> {
    loginSetting.id = id;
    return this.adminService.updateLoginSetting(loginSetting);
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(AdminController.prototype.getPasswordSetting),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
    BACKEND_ADMIN_CONTROL.ACCESS_PASSWORD_SETTINGS,
  )
  @Get('setting/password')
  async getPasswordSetting(): Promise<BaseResponseDto<PasswordSettingDto>> {
    const response = new BaseResponseDto<PasswordSettingDto>();
    response.data = await this.adminService.findPasswordSetting();
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(AdminController.prototype.updatePasswordSetting),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
    BACKEND_ADMIN_CONTROL.ACCESS_PASSWORD_SETTINGS,
  )
  @Put('setting/password/:id')
  updatePasswordSetting(
    @Param('id') id: string,
    @Body() passwordSetting: PasswordSettingDto,
  ): Promise<PasswordSettingDto> {
    passwordSetting.id = id;
    return this.adminService.updatePasswordSetting(passwordSetting);
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(AdminController.prototype.getUserUploadHistory),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_USER_INVATATION_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_USER_UPLOAD,
  )
  @Get('setting/upload/user')
  async getUserUploadHistory(
    @Query() query: BaseQueryDto,
  ): Promise<BaseResponseDto<UserUploadHistoryDto[]>> {
    const take = query.perPage || 10;
    const page = query.page || 1;
    const skip = page > 1 ? take * (page - 1) : 0;
    const response = new BaseResponseDto<UserUploadHistoryDto[]>();
    response.data = await this.userService.getUserUploadHistory(skip, take);
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(AdminController.prototype.addUserUploadHistory),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_USER_UPLOAD,
    BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_USER_INVATATION_MANAGEMENT,
  )
  @ApiBody({ type: [UserUploadFileDto] })
  @Post('setting/upload/user')
  async addUserUploadHistory(
    @Body() userUploadBody: UserUploadFileDto,
    @Req() request: IRequestWithUser,
  ): Promise<BaseResponseDto<boolean>> {
    const response = new BaseResponseDto<boolean>();
    response.data = await this.userService.addUserUploadHistory(
      userUploadBody,
      request.user,
    );
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(AdminController.prototype.proceedUploadedUser),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_USER_UPLOAD,
    BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_USER_INVATATION_MANAGEMENT,
  )
  @ApiQuery({ type: [QueryFileKey] })
  @Post('setting/upload/user/proceed')
  async proceedUploadedUser(@Query() query: QueryFileKey) {
    return this.userService.proceedUploadedUser(query.key);
  }

  @UseGuards(JwtAuthGuard, PolicyGuard(AdminController.prototype.activateUsers))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT)
  @Put('setting/activate/users')
  async activateUsers(@Body() userIdsBody: UserIdentifiers): Promise<void> {
    await this.userService.activateUsers(userIdsBody);
    // TODO: Update specific indices only
    this.searchService.reindexInstructors().catch(() => {
      console.error('Error updating index for user.');
    }); // Silence the error.;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(AdminController.prototype.deactivateUsers),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT)
  @Put('setting/deactivate/users')
  async deactivateUsers(
    @Body() userIdsBody: UserIdentifiers,
    @Req() req: IRequestWithUser,
  ): Promise<void> {
    await this.connection.transaction(async (manager) => {
      await this.userService
        .withTransaction(manager)
        .deactivateUsers(userIdsBody, req.user);
    });
    // TODO: Update specific indices only
    this.searchService.reindexInstructors().catch(() => {
      console.error('Error updating index for user.');
    }); // Silence the error.;
  }

  @UseGuards(JwtAuthGuard, PolicyGuard(AdminController.prototype.unlockUser))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT)
  @HttpCode(204)
  @Put('users/unlock')
  async unlockUser(@Body() userIdsBody: UserIdentifiers) {
    return this.adminService.unlockUsers(userIdsBody);
  }

  @UseGuards(JwtAuthGuard, PolicyGuard(AdminController.prototype.getAllUsers))
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_GROUP_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_ORGANIZATION_MANAGEMENT,
  )
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('users')
  async getAllUsers(
    @Query() query: UserQueryDto,
  ): Promise<BaseResponseDto<GetAllUsers[]>> {
    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const response = new BaseResponseDto<GetAllUsers[]>();
    const result = await this.adminService.findUsers({
      ...query,
      skip,
      take,
      search,
      searchField,
      order,
      orderBy,
    });

    response.data = result.users.map((user) => new GetAllUsers(user));
    response.pagination = getPaginationResponseParams(query, result.userCount);

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(AdminController.prototype.getUsersByEmails),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_ORGANIZATION_MANAGEMENT,
  )
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('users/emails')
  async getUsersByEmails(
    @Body() body: UserEmails,
  ): Promise<BaseResponseDto<GetAllUsers[]>> {
    const response = new BaseResponseDto<GetAllUsers[]>();
    const result = await this.adminService.findUsersByEmails(body.emails);

    response.data = result.map((user) => new GetAllUsers(user));

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(AdminController.prototype.getAllInvitedUsers),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_ORGANIZATION_MANAGEMENT,
  )
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('users/invited')
  async getAllInvitedUsers(
    @Query() query: BaseQueryDto,
  ): Promise<BaseResponseDto<UserManagementResponse[]>> {
    const { skip, take } = getPaginationRequestParams(query);

    const response = new BaseResponseDto<UserManagementResponse[]>();
    const { invitations, count } = await this.adminService.findInvitedUsers(
      true,
      { skip, take },
    );

    response.data = invitations.map(
      (invitedUser) => new UserManagementResponse(invitedUser),
    );
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(AdminController.prototype.updateUserRole),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put('user-role')
  async updateUserRole(@Body() body: UserRole, @Req() req: IRequestWithUser) {
    const userToUpdate = await this.userService.getById(body.userId);
    const updatedUserRole = await this.userService.updateUserRole(
      body.userId,
      body.roleId,
      req.user.id,
    );

    if (
      userToUpdate.userRoles.some(
        (ur) => ur.role.name === SYSTEM_ROLES.INSTRUCTOR,
      ) &&
      updatedUserRole.role.name !== SYSTEM_ROLES.INSTRUCTOR
    ) {
      this.searchService.removeInstructorsFromIndex([body.userId]).catch(() => {
        console.error('Error updating index for user.');
      }); // Silence the error.
    } else if (updatedUserRole.role.name === SYSTEM_ROLES.INSTRUCTOR) {
      this.searchService.bulkIndexInstructors([userToUpdate]).catch(() => {
        console.error('Error updating index for user.');
      }); // Silence the error.;
    }
  }

  @Get('healthcheck')
  @HttpCode(200)
  healthCheck() {
    return 'healthy';
  }
}
