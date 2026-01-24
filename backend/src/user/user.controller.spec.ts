import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserDto } from './dto';
import { ModuleMocker, MockMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
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

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should return the current user wrapped in an object', () => {
      const user = { id: '1', email: 'test@example.com', name: 'Test' };
      const result = controller.getMe(user as any);
      expect(result.user.email).toBe(user.email);
    });
  });

  describe('editUser', () => {
    it('should call userService.editUser and return updated user wrapped in an object', async () => {
      const userId = '1';
      const dto = { name: 'Updated Name' };
      const updatedUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Updated Name',
        password: 'hash',
      };
      (service.editUser as jest.Mock).mockResolvedValue(updatedUser);

      const result = await controller.editUser(userId, dto);

      expect(service.editUser).toHaveBeenCalledWith(userId, dto);
      expect(result.user.name).toBe(dto.name);
      expect((result.user as any).password).toBeUndefined();
    });
  });
});
