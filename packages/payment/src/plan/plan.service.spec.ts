import { Test, TestingModule } from '@nestjs/testing';
import { PlanService } from './plan.service';

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('PlanService', () => {
  let service: PlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanService],
    }).compile();

    service = module.get<PlanService>(PlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
