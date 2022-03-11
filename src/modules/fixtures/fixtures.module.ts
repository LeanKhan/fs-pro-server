import { Module } from '@nestjs/common';
import { FixturesService } from './fixtures.service';
import { FixturesController } from './fixtures.controller';

@Module({
  controllers: [FixturesController],
  providers: [FixturesService]
})
export class FixturesModule {}
