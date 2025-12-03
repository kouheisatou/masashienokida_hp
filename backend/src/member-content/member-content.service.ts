import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MemberContent, Role } from '@prisma/client';

export class CreateMemberContentDto {
  title: string;
  content: string;
  contentType: string;
  thumbnailUrl?: string;
  fileUrl?: string;
  requiredRole: Role;
  published?: boolean;
  publishedAt?: Date;
}

export class UpdateMemberContentDto {
  title?: string;
  content?: string;
  contentType?: string;
  thumbnailUrl?: string;
  fileUrl?: string;
  requiredRole?: Role;
  published?: boolean;
  publishedAt?: Date;
}

@Injectable()
export class MemberContentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createMemberContentDto: CreateMemberContentDto,
  ): Promise<MemberContent> {
    return await this.prisma.memberContent.create({
      data: createMemberContentDto,
    });
  }

  async findAll(userRole?: Role): Promise<MemberContent[]> {
    const where: any = { published: true };

    // Filter by user role
    if (userRole && userRole !== Role.ADMIN) {
      const roleHierarchy = {
        [Role.USER]: [],
        [Role.MEMBER_FREE]: [Role.MEMBER_FREE],
        [Role.MEMBER_GOLD]: [Role.MEMBER_FREE, Role.MEMBER_GOLD],
      };

      where.requiredRole = {
        in: roleHierarchy[userRole] || [],
      };
    }

    return await this.prisma.memberContent.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findOne(id: string, userRole?: Role): Promise<MemberContent> {
    const content = await this.prisma.memberContent.findUnique({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException(`Member content with ID ${id} not found`);
    }

    // Check access permissions
    if (userRole && userRole !== Role.ADMIN) {
      if (!this.canAccessContent(userRole, content.requiredRole)) {
        throw new ForbiddenException(
          'You do not have permission to access this content',
        );
      }
    }

    return content;
  }

  async update(
    id: string,
    updateMemberContentDto: UpdateMemberContentDto,
  ): Promise<MemberContent> {
    await this.findOne(id);

    return await this.prisma.memberContent.update({
      where: { id },
      data: updateMemberContentDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.memberContent.delete({
      where: { id },
    });
  }

  private canAccessContent(userRole: Role, requiredRole: Role): boolean {
    const roleLevel = {
      [Role.USER]: 0,
      [Role.MEMBER_FREE]: 1,
      [Role.MEMBER_GOLD]: 2,
      [Role.ADMIN]: 3,
    };

    return roleLevel[userRole] >= roleLevel[requiredRole];
  }
}
