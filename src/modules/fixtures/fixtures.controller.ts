import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FixturesService } from './fixtures.service';
import { CreateFixtureDto } from './dto/create-fixture.dto';
import { UpdateFixtureDto } from './dto/update-fixture.dto';

@Controller('fixtures')
export class FixturesController {
  constructor(private readonly fixturesService: FixturesService) {}

  @Post()
  create(@Body() createFixtureDto: CreateFixtureDto) {
    return this.fixturesService.create(createFixtureDto);
  }

  @Get()
  findAll() {
    return this.fixturesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fixturesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFixtureDto: UpdateFixtureDto) {
    return this.fixturesService.update(+id, updateFixtureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fixturesService.remove(+id);
  }
}
