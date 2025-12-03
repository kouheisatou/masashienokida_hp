import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Post, Role } from '@prisma/client';

export class CreatePostDto {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  thumbnailUrl?: string;
  published?: boolean;
  membersOnly?: boolean;
  requiredRole?: Role;
  authorId: string;
}

export class UpdatePostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  thumbnailUrl?: string;
  published?: boolean;
  membersOnly?: boolean;
  requiredRole?: Role;
}

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    return await this.prisma.post.create({
      data: createPostDto,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(userRole?: Role): Promise<Post[]> {
    const where: any = { published: true };

    // Filter based on user role
    if (!userRole || userRole === Role.USER) {
      where.membersOnly = false;
    } else if (userRole === Role.MEMBER_FREE) {
      where.OR = [
        { membersOnly: false },
        { AND: [{ membersOnly: true }, { requiredRole: Role.MEMBER_FREE }] },
      ];
    } else if (userRole === Role.MEMBER_GOLD) {
      // MEMBER_GOLD can access both FREE and GOLD content
      // No additional filtering needed
    }
    // ADMIN can access everything

    return await this.prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userRole?: Role): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check access permissions
    if (post.membersOnly && userRole !== Role.ADMIN) {
      if (!userRole || userRole === Role.USER) {
        throw new ForbiddenException('This post is for members only');
      }

      if (post.requiredRole === Role.MEMBER_GOLD && userRole === Role.MEMBER_FREE) {
        throw new ForbiddenException('This post requires GOLD membership');
      }
    }

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    await this.findOne(id);

    return await this.prisma.post.update({
      where: { id },
      data: updatePostDto,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.post.delete({
      where: { id },
    });
  }

  async findByCategory(category: string, userRole?: Role): Promise<Post[]> {
    const posts = await this.findAll(userRole);
    return posts.filter((post) => post.category === category);
  }

  async findByTag(tag: string, userRole?: Role): Promise<Post[]> {
    const posts = await this.findAll(userRole);
    return posts.filter((post) => post.tags.includes(tag));
  }
}
