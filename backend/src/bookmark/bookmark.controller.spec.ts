import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';
import { ModuleMocker, MockMetadata } from 'jest-mock';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { BookmarkResponseDto } from './dto/bookmark-response.dto';
import { BookmarkListResponseDto } from './dto/bookmark-list-response.dto';

const moduleMocker = new ModuleMocker(global);

describe('BookmarkController', () => {
  let controller: BookmarkController;
  let service: BookmarkService;

  const mockUserId = 'user-123';
  const mockBookmarkId = 'bookmark-456';
  const mockBookmarkResponse: BookmarkResponseDto = {
    id: mockBookmarkId,
    title: 'Test Bookmark',
    description: 'Test Description',
    link: 'https://example.com',
    userId: mockUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as BookmarkResponseDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarkController],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(
            mockMetadata,
          ) as ObjectConstructor;
          return new Mock();
        }
      })
      .compile();

    controller = module.get<BookmarkController>(BookmarkController);
    service = module.get<BookmarkService>(BookmarkService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a bookmark', async () => {
      const dto: CreateBookmarkDto = {
        title: 'New Bookmark',
        link: 'https://test.com',
      };
      (service.create as jest.Mock).mockResolvedValue(mockBookmarkResponse);

      const result = await controller.create(mockUserId, dto);

      expect(service.create).toHaveBeenCalledWith(mockUserId, dto);
      expect(result).toEqual(mockBookmarkResponse);
    });
  });

  describe('findAll', () => {
    it('should return all bookmarks with filters', async () => {
      const filters = { search: 'test', page: 1, limit: 10 };
      const mockListResponse = new BookmarkListResponseDto([mockBookmarkResponse], 1, 1, 10);
      (service.findAllWithFilters as jest.Mock).mockResolvedValue(mockListResponse);

      const result = await controller.findAll(mockUserId, filters);

      expect(service.findAllWithFilters).toHaveBeenCalledWith(mockUserId, filters);
      expect(result).toEqual(mockListResponse);
    });
  });

  describe('findOne', () => {
    it('should return a single bookmark', async () => {
      (service.findOne as jest.Mock).mockResolvedValue(mockBookmarkResponse);

      const result = await controller.findOne(mockUserId, mockBookmarkId);

      expect(service.findOne).toHaveBeenCalledWith(mockUserId, mockBookmarkId);
      expect(result).toEqual(mockBookmarkResponse);
    });
  });

  describe('update', () => {
    it('should update a bookmark', async () => {
      const dto: UpdateBookmarkDto = { title: 'Updated Title' };
      const updatedBookmark = { ...mockBookmarkResponse, title: 'Updated Title' };
      (service.update as jest.Mock).mockResolvedValue(updatedBookmark);

      const result = await controller.update(mockUserId, mockBookmarkId, dto);

      expect(service.update).toHaveBeenCalledWith(mockUserId, mockBookmarkId, dto);
      expect(result).toEqual(updatedBookmark);
    });
  });

  describe('remove', () => {
    it('should remove a bookmark', async () => {
      const mockResponse = { message: 'Bookmark deleted successfully' };
      (service.remove as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.remove(mockUserId, mockBookmarkId);

      expect(service.remove).toHaveBeenCalledWith(mockUserId, mockBookmarkId);
      expect(result).toEqual(mockResponse);
    });
  });
});
