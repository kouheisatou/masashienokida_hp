import { Injectable } from '@nestjs/common';
import { CreateDiscographyDto } from './dto/create-discography.dto';
import { UpdateDiscographyDto } from './dto/update-discography.dto';

@Injectable()
export class DiscographyService {
  create(createDiscographyDto: CreateDiscographyDto) {
    return 'This action adds a new discography';
  }

  findAll() {
    return `This action returns all discography`;
  }

  findOne(id: number) {
    return `This action returns a #${id} discography`;
  }

  update(id: number, updateDiscographyDto: UpdateDiscographyDto) {
    return `This action updates a #${id} discography`;
  }

  remove(id: number) {
    return `This action removes a #${id} discography`;
  }
}
