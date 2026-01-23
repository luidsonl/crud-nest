import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: '1', email: 'test@example.com', name: 'Test' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne('1');

      expect(result).toEqual(user);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });
  });

  describe('editUser', () => {
    it('should update and return user without password', async () => {
      const dto = { name: 'Updated Name' };
      const updatedUser = { id: '1', email: 'test@example.com', name: 'Updated Name', password: 'hash' };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.editUser('1', dto);

      expect(result.name).toBe(dto.name);
      expect((result as any).password).toBeUndefined();
    });
  });
});
