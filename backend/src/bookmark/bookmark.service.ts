import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateBookmarkDto, UpdateBookmarkDto, BookmarkListResponseDto, BookmarkResponseDto  } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  
  async create(userId: string, createBookmarkDto: CreateBookmarkDto): Promise<BookmarkResponseDto> {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        title: createBookmarkDto.title,
        description: createBookmarkDto.description,
        link: createBookmarkDto.link,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return plainToInstance(BookmarkResponseDto, bookmark);
  }

  async findAll(userId: string): Promise<BookmarkListResponseDto> {
    const [bookmarks, total] = await Promise.all([
      this.prisma.bookmark.findMany({
        where: {
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.bookmark.count({
        where: { userId },
      }),
    ]);

    const bookmarkDtos = plainToInstance(BookmarkResponseDto, bookmarks);
    return new BookmarkListResponseDto(bookmarkDtos, total);
  }

  async findOne(userId: string, id: string): Promise<BookmarkResponseDto> {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    if (bookmark.userId !== userId) {
      throw new ForbiddenException('Access denied to this bookmark');
    }

    return plainToInstance(BookmarkResponseDto, bookmark);
  }

  async update(
    userId: string, 
    id: string, 
    updateBookmarkDto: UpdateBookmarkDto
  ): Promise<BookmarkResponseDto> {
    const existingBookmark = await this.prisma.bookmark.findUnique({
      where: {
        id,
      },
    });

    if (!existingBookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    if (existingBookmark.userId !== userId) {
      throw new ForbiddenException('Access denied to this bookmark');
    }

    const updatedBookmark = await this.prisma.bookmark.update({
      where: {
        id,
      },
      data: {
        title: updateBookmarkDto.title,
        description: updateBookmarkDto.description,
        link: updateBookmarkDto.link,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return plainToInstance(BookmarkResponseDto, updatedBookmark);
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id,
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    if (bookmark.userId !== userId) {
      throw new ForbiddenException('Access denied to this bookmark');
    }

    await this.prisma.bookmark.delete({
      where: {
        id,
      },
    });

    return { message: 'Bookmark deleted successfully' };
  }

  async findAllWithFilters(
    userId: string,
    filters?: {
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<BookmarkListResponseDto> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [bookmarks, total] = await Promise.all([
      this.prisma.bookmark.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.bookmark.count({ where }),
    ]);

    const bookmarkDtos = plainToInstance(BookmarkResponseDto, bookmarks);
    return new BookmarkListResponseDto(bookmarkDtos, total, page, limit);
  }
}