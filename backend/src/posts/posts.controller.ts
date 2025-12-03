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
import { PostsService, CreatePostDto, UpdatePostDto } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, User } from '@prisma/client';

interface RequestWithUser extends Request {
  user?: User;
}

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post (Admin only)' })
  @ApiBody({ type: CreatePostDto })
  async create(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.create(createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts (filtered by user role)' })
  async findAll(@Req() req: RequestWithUser) {
    const userRole = req.user?.role;
    return await this.postsService.findAll(userRole);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get posts by category' })
  @ApiParam({ name: 'category', type: 'string' })
  async findByCategory(
    @Param('category') category: string,
    @Req() req: RequestWithUser,
  ) {
    const userRole = req.user?.role;
    return await this.postsService.findByCategory(category, userRole);
  }

  @Get('tag/:tag')
  @ApiOperation({ summary: 'Get posts by tag' })
  @ApiParam({ name: 'tag', type: 'string' })
  async findByTag(@Param('tag') tag: string, @Req() req: RequestWithUser) {
    const userRole = req.user?.role;
    return await this.postsService.findByTag(tag, userRole);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userRole = req.user?.role;
    return await this.postsService.findOne(id, userRole);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdatePostDto })
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return await this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async remove(@Param('id') id: string) {
    await this.postsService.remove(id);
    return { message: 'Post deleted successfully' };
  }
}
