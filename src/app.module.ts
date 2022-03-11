import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClubModule } from './modules/club/club.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { PlayersModule } from './modules/players/players.module';
import { AwardsModule } from './modules/awards/awards.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { CompetitionsModule } from './modules/competitions/competitions.module';
import { DaysModule } from './modules/days/days.module';
import { FixturesModule } from './modules/fixtures/fixtures.module';
import { ManagersModule } from './modules/managers/managers.module';
import { GameModule } from './modules/game/game.module';
import { SeasonsModule } from './modules/seasons/seasons.module';
import { UserModule } from './modules/user/user.module';
import { PlacesModule } from './modules/places/places.module';

@Module({
  imports: [
    ClubModule,
    ClubsModule,
    PlayersModule,
    AwardsModule,
    CalendarModule,
    CompetitionsModule,
    DaysModule,
    FixturesModule,
    ManagersModule,
    GameModule,
    SeasonsModule,
    UserModule,
    PlacesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
