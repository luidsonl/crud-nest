import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './dto';
import { ModuleMocker, MockMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should call authService.signUp and return formatted user', async () => {
      const dto: SignUpDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        confirmPassword: 'password123',
      };
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test',
        password: 'secret_hash',
      };
      (service.signUp as jest.Mock).mockResolvedValue(user);

      const result = await controller.signUp(dto);

      expect(service.signUp).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(user.email);
      expect((result.user as any).password).toBeUndefined();
    });
  });

  describe('signIn', () => {
    it('should call authService.signIn and return access token and formatted user', async () => {
      const dto: SignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const loginResult = {
        access_token: 'token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test',
          password: 'secret_hash',
        },
      };
      (service.signIn as jest.Mock).mockResolvedValue(loginResult);

      const result = await controller.signIn(dto);

      expect(service.signIn).toHaveBeenCalledWith(dto);
      expect(result.access_token).toBe('token');
      expect(result.user.email).toBe(loginResult.user.email);
      expect((result.user as any).password).toBeUndefined();
    });
  });
});
