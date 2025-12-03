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
import { HistoryService, CreateHistoryDto, UpdateHistoryDto } from './history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('history')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new history entry (Admin only)' })
  @ApiBody({ type: CreateHistoryDto })
  async create(@Body() createHistoryDto: CreateHistoryDto) {
    return await this.historyService.create(createHistoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all history entries' })
  async findAll() {
    return await this.historyService.findAll();
  }

  @Get('years')
  @ApiOperation({ summary: 'Get all years with history entries' })
  async getYears() {
    return await this.historyService.getYears();
  }

  @Get('year/:year')
  @ApiOperation({ summary: 'Get history entries by year' })
  @ApiParam({ name: 'year', type: 'number' })
  async findByYear(@Param('year') year: string) {
    return await this.historyService.findByYear(parseInt(year, 10));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get history entry by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  async findOne(@Param('id') id: string) {
    return await this.historyService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update history entry (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateHistoryDto })
  async update(
    @Param('id') id: string,
    @Body() updateHistoryDto: UpdateHistoryDto,
  ) {
    return await this.historyService.update(id, updateHistoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete history entry (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async remove(@Param('id') id: string) {
    await this.historyService.remove(id);
    return { message: 'History entry deleted successfully' };
  }
}
