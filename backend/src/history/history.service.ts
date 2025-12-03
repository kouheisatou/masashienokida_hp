import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { History } from '@prisma/client';

export class CreateHistoryDto {
  year: number;
  date?: Date;
  title: string;
  description: string;
  venue?: string;
  category?: string;
  imageUrl?: string;
  reviews?: string;
}

export class UpdateHistoryDto {
  year?: number;
  date?: Date;
  title?: string;
  description?: string;
  venue?: string;
  category?: string;
  imageUrl?: string;
  reviews?: string;
}

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createHistoryDto: CreateHistoryDto): Promise<History> {
    return await this.prisma.history.create({
      data: createHistoryDto,
    });
  }

  async findAll(): Promise<History[]> {
    return await this.prisma.history.findMany({
      orderBy: [{ year: 'desc' }, { date: 'desc' }],
    });
  }

  async findByYear(year: number): Promise<History[]> {
    return await this.prisma.history.findMany({
      where: { year },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string): Promise<History> {
    const history = await this.prisma.history.findUnique({
      where: { id },
    });

    if (!history) {
      throw new NotFoundException(`History with ID ${id} not found`);
    }

    return history;
  }

  async update(
    id: string,
    updateHistoryDto: UpdateHistoryDto,
  ): Promise<History> {
    await this.findOne(id);

    return await this.prisma.history.update({
      where: { id },
      data: updateHistoryDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.history.delete({
      where: { id },
    });
  }

  async getYears(): Promise<number[]> {
    const years = await this.prisma.history.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' },
    });

    return years.map((h) => h.year);
  }
}
