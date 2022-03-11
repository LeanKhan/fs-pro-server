import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClubModule } from './modules/club/club.module';

@Module({
  imports: [ClubModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
