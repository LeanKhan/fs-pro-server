import { Module } from '@nestjs/common';
import { SeasonsService } from './seasons.service';
import { SeasonsController } from './seasons.controller';

@Module({
  controllers: [SeasonsController],
  providers: [SeasonsService]
})
export class SeasonsModule {}
