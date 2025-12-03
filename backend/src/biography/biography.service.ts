import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Biography } from '@prisma/client';

export class CreateBiographyDto {
  language: string;
  content: string;
  summary?: string;
  photoUrls?: string[];
  awards?: string;
  education?: string;
  isPublished?: boolean;
}

export class UpdateBiographyDto {
  language?: string;
  content?: string;
  summary?: string;
  photoUrls?: string[];
  awards?: string;
  education?: string;
  isPublished?: boolean;
}

@Injectable()
export class BiographyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBiographyDto: CreateBiographyDto): Promise<Biography> {
    return await this.prisma.biography.create({
      data: createBiographyDto,
    });
  }

  async findAll(): Promise<Biography[]> {
    return await this.prisma.biography.findMany({
      where: { isPublished: true },
      orderBy: { language: 'asc' },
    });
  }

  async findByLanguage(language: string): Promise<Biography | null> {
    return await this.prisma.biography.findUnique({
      where: { language },
    });
  }

  async findOne(id: string): Promise<Biography> {
    const biography = await this.prisma.biography.findUnique({
      where: { id },
    });

    if (!biography) {
      throw new NotFoundException(`Biography with ID ${id} not found`);
    }

    return biography;
  }

  async update(
    id: string,
    updateBiographyDto: UpdateBiographyDto,
  ): Promise<Biography> {
    const biography = await this.findOne(id);

    return await this.prisma.biography.update({
      where: { id: biography.id },
      data: updateBiographyDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.biography.delete({
      where: { id },
    });
  }
}
