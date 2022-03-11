import { Test, TestingModule } from '@nestjs/testing';
import { DaysController } from './days.controller';
import { DaysService } from './days.service';

describe('DaysController', () => {
  let controller: DaysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DaysController],
      providers: [DaysService],
    }).compile();

    controller = module.get<DaysController>(DaysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
