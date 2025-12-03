import { PartialType } from '@nestjs/swagger';
import { CreateDiscographyDto } from './create-discography.dto';

export class UpdateDiscographyDto extends PartialType(CreateDiscographyDto) {}
