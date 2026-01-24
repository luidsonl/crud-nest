import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkService } from './bookmark.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { plainToInstance } from 'class-transformer';
import { BookmarkResponseDto } from './dto/bookmark-response.dto';

describe('BookmarkService', () => {
  let service: BookmarkService;
  let prisma: PrismaService;

  // Mock data
  const mockUserId = 'user-123';
  const mockBookmarkId = 'bookmark-456';
  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockBookmark = {
    id: mockBookmarkId,
    title: 'Test Bookmark',
    description: 'Test Description',
    link: 'https://example.com',
    userId: mockUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
  };

  const mockBookmarkWithoutUser = {
    ...mockBookmark,
    user: undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarkService,
        {
          provide: PrismaService,
          useValue: {
            bookmark: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<BookmarkService>(BookmarkService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a bookmark successfully', async () => {
      const createDto: CreateBookmarkDto = {
        title: 'New Bookmark',
        description: 'New Description',
        link: 'https://new-example.com',
      };

      (prisma.bookmark.create as jest.Mock).mockResolvedValue(mockBookmark);

      const result = await service.create(mockUserId, createDto);

      expect(prisma.bookmark.create).toHaveBeenCalledWith({
        data: {
          title: createDto.title,
          description: createDto.description,
          link: createDto.link,
          userId: mockUserId,
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

      // Verifica se o resultado é uma instância do DTO
      expect(result).toEqual(
        plainToInstance(BookmarkResponseDto, mockBookmark),
      );
    });

    it('should create bookmark without optional fields', async () => {
      const createDto: CreateBookmarkDto = {
        title: 'New Bookmark',
      };

      const bookmarkWithoutOptional = {
        ...mockBookmark,
        description: null,
        link: null,
      };

      (prisma.bookmark.create as jest.Mock).mockResolvedValue(
        bookmarkWithoutOptional,
      );

      await service.create(mockUserId, createDto);

      expect(prisma.bookmark.create).toHaveBeenCalledWith({
        data: {
          title: createDto.title,
          description: undefined,
          link: undefined,
          userId: mockUserId,
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
    });
  });

  describe('findAll', () => {
    it('should return all bookmarks for a user', async () => {
      const mockBookmarks = [mockBookmark, { ...mockBookmark, id: 'bookmark-789' }];
      const totalCount = mockBookmarks.length;

      (prisma.bookmark.findMany as jest.Mock).mockResolvedValue(mockBookmarks);
      (prisma.bookmark.count as jest.Mock).mockResolvedValue(totalCount);

      const result = await service.findAll(mockUserId);

      expect(prisma.bookmark.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(totalCount);
      expect(result.data[0]).toEqual(
        plainToInstance(BookmarkResponseDto, mockBookmark),
      );
    });

    it('should return empty array when user has no bookmarks', async () => {
      (prisma.bookmark.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.bookmark.count as jest.Mock).mockResolvedValue(0);

      const result = await service.findAll(mockUserId);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a bookmark by id', async () => {
      (prisma.bookmark.findUnique as jest.Mock).mockResolvedValue(mockBookmark);

      const result = await service.findOne(mockUserId, mockBookmarkId);

      expect(prisma.bookmark.findUnique).toHaveBeenCalledWith({
        where: { id: mockBookmarkId },
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
      expect(result).toEqual(plainToInstance(BookmarkResponseDto, mockBookmark));
    });

    it('should throw NotFoundException when bookmark does not exist', async () => {
      (prisma.bookmark.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(mockUserId, mockBookmarkId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own the bookmark', async () => {
      const otherUserBookmark = {
        ...mockBookmark,
        userId: 'other-user-789',
      };

      (prisma.bookmark.findUnique as jest.Mock).mockResolvedValue(
        otherUserBookmark,
      );

      await expect(service.findOne(mockUserId, mockBookmarkId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateBookmarkDto = {
      title: 'Updated Title',
      description: 'Updated Description',
    };

    const updatedBookmark = {
      ...mockBookmark,
      title: updateDto.title,
      description: updateDto.description,
    };

    it('should update a bookmark successfully', async () => {
      (prisma.bookmark.findUnique as jest.Mock).mockResolvedValue(mockBookmark);
      (prisma.bookmark.update as jest.Mock).mockResolvedValue(updatedBookmark);

      const result = await service.update(mockUserId, mockBookmarkId, updateDto);

      expect(prisma.bookmark.findUnique).toHaveBeenCalledWith({
        where: { id: mockBookmarkId },
      });

      expect(prisma.bookmark.update).toHaveBeenCalledWith({
        where: { id: mockBookmarkId },
        data: {
          title: updateDto.title,
          description: updateDto.description,
          link: undefined,
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

      expect(result).toEqual(
        plainToInstance(BookmarkResponseDto, updatedBookmark),
      );
    });

    it('should update only provided fields', async () => {
      const partialUpdateDto: UpdateBookmarkDto = {
        title: 'Only Title Updated',
      };

      const partiallyUpdatedBookmark = {
        ...mockBookmark,
        title: partialUpdateDto.title,
      };

      (prisma.bookmark.findUnique as jest.Mock).mockResolvedValue(mockBookmark);
      (prisma.bookmark.update as jest.Mock).mockResolvedValue(
        partiallyUpdatedBookmark,
      );

      await service.update(mockUserId, mockBookmarkId, partialUpdateDto);

      expect(prisma.bookmark.update).toHaveBeenCalledWith({
        where: { id: mockBookmarkId },
        data: {
          title: partialUpdateDto.title,
          description: undefined,
          link: undefined,
        },
        include: expect.any(Object),
      });
    });

    it('should set link to null when link is null in update', async () => {
      const updateWithNullLink: UpdateBookmarkDto = {
        link: null as any,
      };

      (prisma.bookmark.findUnique as jest.Mock).mockResolvedValue(mockBookmark);
      (prisma.bookmark.update as jest.Mock).mockResolvedValue({
        ...mockBookmark,
        link: null,
      });

      await service.update(mockUserId, mockBookmarkId, updateWithNullLink);

      expect(prisma.bookmark.update).toHaveBeenCalledWith({
        where: { id: mockBookmarkId },
        data: {
          title: undefined,
          description: undefined,
          link: null,
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
    });

    it('should throw NotFoundException when bookmark does not exist', async () => {
      (prisma.bookmark.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update(mockUserId, mockBookmarkId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own the bookmark', async () => {
      const otherUserBookmark = {
        ...mockBookmark,
        userId: 'other-user-789',
      };

      (prisma.bookmark.findUnique as jest.Mock).mockResolvedValue(
        otherUserBookmark,
      );

      await expect(
        service.update(mockUserId, mockBookmarkId, updateDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a bookmark successfully', async () => {
      (prisma.bookmark.findUnique as jest.Mock).mockResolvedValue(mockBookmark);
      (prisma.bookmark.delete as jest.Mock).mockResolvedValue(mockBookmark);

      const result = await service.remove(mockUserId, mockBookmarkId);

      expect(prisma.bookmark.findUnique).toHaveBeenCalledWith({
        where: { id: mockBookmarkId },
      });

      expect(prisma.bookmark.delete).toHaveBeenCalledWith({
        where: { id: mockBookmarkId },
      });

      expect(result).toEqual({ message: 'Bookmark deleted successfully' });
    });

    it('should throw NotFoundException when bookmark does not exist', async () => {
      (prisma.bookmark.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove(mockUserId, mockBookmarkId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own the bookmark', async () => {
      const otherUserBookmark = {
        ...mockBookmark,
        userId: 'other-user-789',
      };

      (prisma.bookmark.findUnique as jest.Mock).mockResolvedValue(
        otherUserBookmark,
      );

      await expect(service.remove(mockUserId, mockBookmarkId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAllWithFilters', () => {
    const mockFilters = {
      search: 'test',
      page: 1,
      limit: 10,
    };

    it('should return bookmarks with filters', async () => {
      const mockBookmarks = [mockBookmark];
      const totalCount = 1;

      (prisma.bookmark.findMany as jest.Mock).mockResolvedValue(mockBookmarks);
      (prisma.bookmark.count as jest.Mock).mockResolvedValue(totalCount);

      const result = await service.findAllWithFilters(mockUserId, mockFilters);

      const expectedWhere = {
        userId: mockUserId,
        OR: [
          { title: { contains: 'test', mode: 'insensitive' } },
          { description: { contains: 'test', mode: 'insensitive' } },
        ],
      };

      expect(prisma.bookmark.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        skip: 0,
        take: mockFilters.limit,
        orderBy: { createdAt: 'desc' },
      });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(totalCount);
      expect(result.page).toBe(mockFilters.page);
      expect(result.limit).toBe(mockFilters.limit);
    });

    it('should use default pagination values', async () => {
      const mockBookmarks = [mockBookmark];
      const totalCount = 1;

      (prisma.bookmark.findMany as jest.Mock).mockResolvedValue(mockBookmarks);
      (prisma.bookmark.count as jest.Mock).mockResolvedValue(totalCount);

      await service.findAllWithFilters(mockUserId, {});

      expect(prisma.bookmark.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        include: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle pagination correctly', async () => {
      const filters = {
        page: 2,
        limit: 5,
      };

      (prisma.bookmark.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.bookmark.count as jest.Mock).mockResolvedValue(0);

      await service.findAllWithFilters(mockUserId, filters);

      expect(prisma.bookmark.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page - 1) * limit = (2-1)*5 = 5
          take: 5,
        }),
      );
    });

    it('should return correct total pages calculation', async () => {
      const filters = {
        page: 1,
        limit: 10,
      };
      const totalCount = 25;

      (prisma.bookmark.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.bookmark.count as jest.Mock).mockResolvedValue(totalCount);

      const result = await service.findAllWithFilters(mockUserId, filters);

      expect(result.totalPages).toBe(3); // Math.ceil(25 / 10) = 3
    });

    it('should work without search filter', async () => {
      const filters = {
        page: 1,
        limit: 10,
      };

      (prisma.bookmark.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.bookmark.count as jest.Mock).mockResolvedValue(0);

      await service.findAllWithFilters(mockUserId, filters);

      expect(prisma.bookmark.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        include: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});