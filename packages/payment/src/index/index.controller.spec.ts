import { Test, TestingModule } from '@nestjs/testing';
import { IndexController } from './index.controller';

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('IndexController', () => {
  let controller: IndexController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndexController],
    }).compile();

    controller = module.get<IndexController>(IndexController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
