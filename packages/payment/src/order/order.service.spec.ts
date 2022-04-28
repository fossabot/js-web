import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderService],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
