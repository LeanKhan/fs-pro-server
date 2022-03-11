import { Module } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';

@Module({
  controllers: [ClubsController],
  providers: [ClubsService]
})
export class ClubsModule {}
