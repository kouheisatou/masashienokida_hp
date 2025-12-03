import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { BiographyService, CreateBiographyDto, UpdateBiographyDto } from './biography.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('biography')
@Controller('biography')
export class BiographyController {
  constructor(private readonly biographyService: BiographyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new biography (Admin only)' })
  @ApiBody({ type: CreateBiographyDto })
  async create(@Body() createBiographyDto: CreateBiographyDto) {
    return await this.biographyService.create(createBiographyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all published biographies' })
  async findAll() {
    return await this.biographyService.findAll();
  }

  @Get('language/:language')
  @ApiOperation({ summary: 'Get biography by language (ja or en)' })
  @ApiParam({ name: 'language', type: 'string' })
  async findByLanguage(@Param('language') language: string) {
    return await this.biographyService.findByLanguage(language);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get biography by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  async findOne(@Param('id') id: string) {
    return await this.biographyService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update biography (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateBiographyDto })
  async update(
    @Param('id') id: string,
    @Body() updateBiographyDto: UpdateBiographyDto,
  ) {
    return await this.biographyService.update(id, updateBiographyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete biography (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async remove(@Param('id') id: string) {
    await this.biographyService.remove(id);
    return { message: 'Biography deleted successfully' };
  }
}
