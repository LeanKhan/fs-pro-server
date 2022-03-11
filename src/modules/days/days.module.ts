import { Module } from '@nestjs/common';
import { DaysService } from './days.service';
import { DaysController } from './days.controller';

@Module({
  controllers: [DaysController],
  providers: [DaysService]
})
export class DaysModule {}
