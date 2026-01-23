import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { GetMeDto } from './dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    editUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should return the current user', () => {
      const user = { id: '1', email: 'test@example.com', name: 'Test' };
      const result = controller.getMe(user as any);
      expect(result.email).toBe(user.email);
    });
  });

  describe('editUser', () => {
    it('should call userService.editUser and return updated user', async () => {
      const userId = '1';
      const dto = { name: 'Updated Name' };
      const updatedUser = { id: '1', email: 'test@example.com', name: 'Updated Name', password: 'hash' };
      mockUserService.editUser.mockResolvedValue(updatedUser);

      const result = await controller.editUser(userId, dto);

      expect(service.editUser).toHaveBeenCalledWith(userId, dto);
      expect(result.name).toBe(dto.name);
      expect((result as any).password).toBeUndefined();
    });
  });
});
