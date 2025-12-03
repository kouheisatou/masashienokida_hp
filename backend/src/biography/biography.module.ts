import { Module } from '@nestjs/common';
import { BiographyController } from './biography.controller';
import { BiographyService } from './biography.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [BiographyController],
  providers: [BiographyService, PrismaService],
})
export class BiographyModule {}
