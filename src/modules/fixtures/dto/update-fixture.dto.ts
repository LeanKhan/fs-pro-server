import { PartialType } from '@nestjs/mapped-types';
import { CreateFixtureDto } from './create-fixture.dto';

export class UpdateFixtureDto extends PartialType(CreateFixtureDto) {}
