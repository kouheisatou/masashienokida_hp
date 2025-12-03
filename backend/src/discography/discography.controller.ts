import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DiscographyService } from './discography.service';
import { CreateDiscographyDto } from './dto/create-discography.dto';
import { UpdateDiscographyDto } from './dto/update-discography.dto';

@Controller('discography')
export class DiscographyController {
  constructor(private readonly discographyService: DiscographyService) {}

  @Post()
  create(@Body() createDiscographyDto: CreateDiscographyDto) {
    return this.discographyService.create(createDiscographyDto);
  }

  @Get()
  findAll() {
    return this.discographyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discographyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDiscographyDto: UpdateDiscographyDto) {
    return this.discographyService.update(+id, updateDiscographyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discographyService.remove(+id);
  }
}
