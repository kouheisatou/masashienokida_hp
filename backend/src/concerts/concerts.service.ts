import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';

@Injectable()
export class ConcertsService {
  constructor(private prisma: PrismaService) { }

  create(createConcertDto: CreateConcertDto) {
    return this.prisma.concert.create({
      data: createConcertDto,
    });
  }

  findAll() {
    return this.prisma.concert.findMany({
      orderBy: { date: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.concert.findUnique({
      where: { id },
    });
  }

  update(id: string, updateConcertDto: UpdateConcertDto) {
    return this.prisma.concert.update({
      where: { id },
      data: updateConcertDto,
    });
  }

  remove(id: string) {
    return this.prisma.concert.delete({
      where: { id },
    });
  }
}
