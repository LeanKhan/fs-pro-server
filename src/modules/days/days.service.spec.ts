import { Test, TestingModule } from '@nestjs/testing';
import { DaysService } from './days.service';

describe('DaysService', () => {
  let service: DaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DaysService],
    }).compile();

    service = module.get<DaysService>(DaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
