import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { TrimPipe } from '@seaccentral/core/dist/utils/TrimPipe';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import {
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';

import { PlanService } from './plan.service';
import { CreatePlan } from './dto/CreatePlan.dto';
import { PlanResponse } from './dto/PlanResponse.dto';
import { GetPlanQuery } from './dto/GetPlanQuery.dto';
import { UpdatePlan } from './dto/UpdatePlan.dto';

@Controller('v1/plan')
@ApiTags('Plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get('')
  async getAllPublic(@Query() query: GetPlanQuery) {
    const { skip, take } = getPaginationRequestParams(query);

    const response = new BaseResponseDto<PlanResponse[]>();
    const { plans, count } = await this.planService.getPublicPlans({
      ...query,
      skip,
      take,
    });

    response.data = plans.map((p) => new PlanResponse(p));
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, PolicyGuard(PlanController.prototype.getAll))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL)
  async getAll(@Query() query: GetPlanQuery) {
    const { skip, take } = getPaginationRequestParams(query);
    const response = new BaseResponseDto<PlanResponse[]>();
    const [plans, count] = await this.planService.findAll({
      ...query,
      skip,
      take,
    });

    response.data = plans.map((p) => new PlanResponse(p));
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @Get(':planId')
  async getOnePublic(@Param('planId') planId: string) {
    const response = new BaseResponseDto<PlanResponse>();
    const plan = await this.planService.getPublicPlanById(planId);

    response.data = new PlanResponse(plan);

    return response;
  }

  @Get(':planId/all')
  @UseGuards(JwtAuthGuard, PolicyGuard(PlanController.prototype.getOne))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL)
  async getOne(
    @Param('planId') planId: string,
    @Query('withCourseBundles') withCourseBundles = false,
  ) {
    const response = new BaseResponseDto<PlanResponse>();
    const plan = await this.planService.getById(planId, withCourseBundles);

    response.data = new PlanResponse(plan);

    return response;
  }

  @Put(':planId/link/organization/:organizationId')
  @UseGuards(JwtAuthGuard)
  async linkWithOrganization(
    @Param('planId') planId: string,
    @Param('organizationId') organizationId: string,
  ) {
    const response = new BaseResponseDto<PlanResponse>();
    const plan = await this.planService.linkWithOrganization(
      planId,
      organizationId,
    );

    response.data = new PlanResponse(plan);

    return response;
  }

  @Put(':planId/unlink/organization/:organizationId')
  @UseGuards(JwtAuthGuard)
  async unlinkWithOrganization(
    @Param('planId') planId: string,
    @Param('organizationId') organizationId: string,
  ) {
    const response = new BaseResponseDto<PlanResponse>();
    const plan = await this.planService.unlinkWithOrganization(
      planId,
      organizationId,
    );

    response.data = new PlanResponse(plan);

    return response;
  }

  @Post('')
  @UseGuards(JwtAuthGuard, PolicyGuard(PlanController.prototype.create))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL)
  @UsePipes(new TrimPipe())
  async create(@Body() planBody: CreatePlan) {
    const response = new BaseResponseDto<PlanResponse>();
    const newPlan = await this.planService.createPlan(planBody);

    response.data = new PlanResponse(newPlan);

    return response;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PolicyGuard(PlanController.prototype.update))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL)
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  async update(@Param('id') id: string, @Body() body: UpdatePlan) {
    const response = new BaseResponseDto<PlanResponse>();
    const updatedPlan = await this.planService.updatePlan(id, body);

    response.data = new PlanResponse(updatedPlan);

    return response;
  }
}
