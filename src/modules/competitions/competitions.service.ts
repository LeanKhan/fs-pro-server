import { Injectable } from '@nestjs/common';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';

@Injectable()
export class CompetitionsService {
  create(createCompetitionDto: CreateCompetitionDto) {
    return 'This action adds a new competition';
  }

  findAll() {
    return `This action returns all competitions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} competition`;
  }

  update(id: number, updateCompetitionDto: UpdateCompetitionDto) {
    return `This action updates a #${id} competition`;
  }

  remove(id: number) {
    return `This action removes a #${id} competition`;
  }
}
