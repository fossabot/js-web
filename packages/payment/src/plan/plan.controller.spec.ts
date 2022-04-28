import { Test, TestingModule } from '@nestjs/testing';
import { PlanController } from './plan.controller';

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('PlanController', () => {
  let controller: PlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanController],
    }).compile();

    controller = module.get<PlanController>(PlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
