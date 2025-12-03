import { Module } from '@nestjs/common';
import { DiscographyService } from './discography.service';
import { DiscographyController } from './discography.controller';

@Module({
  controllers: [DiscographyController],
  providers: [DiscographyService],
})
export class DiscographyModule {}
