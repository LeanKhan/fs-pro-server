import { Module } from '@nestjs/common';
import { ManagersService } from './managers.service';
import { ManagersController } from './managers.controller';

@Module({
  controllers: [ManagersController],
  providers: [ManagersService]
})
export class ManagersModule {}
