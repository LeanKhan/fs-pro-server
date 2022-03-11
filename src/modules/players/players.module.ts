import { Module } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';

@Module({
  controllers: [PlayersController],
  providers: [PlayersService]
})
export class PlayersModule {}
