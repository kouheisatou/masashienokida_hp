import { Module } from '@nestjs/common';
import { MemberContentController } from './member-content.controller';
import { MemberContentService } from './member-content.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MemberContentController],
  providers: [MemberContentService, PrismaService],
})
export class MemberContentModule {}
