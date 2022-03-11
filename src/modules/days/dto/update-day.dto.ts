import { PartialType } from '@nestjs/mapped-types';
import { CreateDayDto } from './create-day.dto';

export class UpdateDayDto extends PartialType(CreateDayDto) {}
