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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  ContactService,
  CreateContactDto,
  UpdateContactDto,
} from './contact.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ContactStatus, User } from '@prisma/client';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a contact inquiry' })
  @ApiBody({ type: CreateContactDto })
  async create(@Body() createContactDto: CreateContactDto) {
    return await this.contactService.create(createContactDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all contact inquiries (Admin only)' })
  @ApiQuery({ name: 'status', required: false, enum: ContactStatus })
  async findAll(@Query('status') status?: ContactStatus) {
    if (status) {
      return await this.contactService.findByStatus(status);
    }
    return await this.contactService.findAll();
  }

  @Get('my-contacts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user contact inquiries' })
  async getUserContacts(@Req() req: RequestWithUser) {
    return await this.contactService.getUserContacts(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get contact inquiry by ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async findOne(@Param('id') id: string) {
    return await this.contactService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update contact inquiry (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateContactDto })
  async update(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return await this.contactService.update(id, updateContactDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete contact inquiry (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async remove(@Param('id') id: string) {
    await this.contactService.remove(id);
    return { message: 'Contact inquiry deleted successfully' };
  }
}
