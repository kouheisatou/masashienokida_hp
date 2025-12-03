import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import {
  MemberContentService,
  CreateMemberContentDto,
  UpdateMemberContentDto,
} from './member-content.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, User } from '@prisma/client';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('member-content')
@Controller('member-content')
export class MemberContentController {
  constructor(private readonly memberContentService: MemberContentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create member-only content (Admin only)' })
  @ApiBody({ type: CreateMemberContentDto })
  async create(@Body() createMemberContentDto: CreateMemberContentDto) {
    return await this.memberContentService.create(createMemberContentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all accessible member content' })
  async findAll(@Req() req: RequestWithUser) {
    return await this.memberContentService.findAll(req.user.role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get member content by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return await this.memberContentService.findOne(id, req.user.role);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update member content (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateMemberContentDto })
  async update(
    @Param('id') id: string,
    @Body() updateMemberContentDto: UpdateMemberContentDto,
  ) {
    return await this.memberContentService.update(id, updateMemberContentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete member content (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async remove(@Param('id') id: string) {
    await this.memberContentService.remove(id);
    return { message: 'Member content deleted successfully' };
  }
}
