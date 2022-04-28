import { ApiTags } from '@nestjs/swagger';
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { User as UserEntity } from '@seaccentral/core/dist/user/User.entity';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import { Policy as PolicyEntity } from '@seaccentral/core/dist/user/Policy.entity';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import {
  ApiBaseResponse,
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
  getSearchRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';

import { User } from './user.decorator';
import { PolicyService } from './policy.service';
import { GetPolicyDto } from './dto/GetPolicy.dto';

@Controller('v1/policies')
@ApiTags('Policy')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyPolicy(@User() me: UserEntity) {
    const policies = await this.policyService.getPolicies(me);
    const response = new BaseResponseDto<GetPolicyDto>();
    response.data = { policies };

    return response;
  }

  @Get('/')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(PolicyController.prototype.getAllPolicies),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBaseResponse(PolicyEntity, { pagination: true })
  async getAllPolicies(@Query() query: BaseQueryDto) {
    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const { policies, count } = await this.policyService.getAllPolicies({
      skip,
      take,
      search,
      searchField,
      order,
      orderBy,
    });
    const response = new BaseResponseDto<PolicyEntity[]>();

    response.data = policies;
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }
}
