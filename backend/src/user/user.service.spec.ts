import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { ModuleMocker, MockMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

jest.mock('argon2', () => ({
  hash: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
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

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);


    if (!prisma.user) {
      (prisma as any).user = {
        findUnique: jest.fn(),
        update: jest.fn(),
      }
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: '1', email: 'test@example.com', name: 'Test' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      const result = await service.findOne('1');

      expect(result).toEqual(user);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('editUser', () => {
    it('should update and return user without password', async () => {
      const dto = { name: 'Updated Name' };
      const updatedUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Updated Name',
        password: 'hash',
      };
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.editUser('1', dto);

      expect(result.name).toBe(dto.name);
      expect((result as any).password).toBeUndefined();
    });
  });
});
