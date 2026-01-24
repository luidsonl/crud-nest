import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';
import { ModuleMocker, MockMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let config: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
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

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    config = module.get<ConfigService>(ConfigService);

    if (!prisma.user) {
      (prisma as any).user = {
        create: jest.fn(),
        findUnique: jest.fn(),
      };
    }

    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'test_secret';
      return null;
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      confirmPassword: 'password123',
    };

    it('should create a new user', async () => {
      const hash = 'hashed_password';
      (argon.hash as jest.Mock).mockResolvedValue(hash);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: '1',
        email: dto.email,
        name: dto.name,
        password: hash,
      });

      const result = await service.signUp(dto);

      expect(result).toBeDefined();
      expect(result.email).toEqual(dto.email);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          name: dto.name,
          password: hash,
        },
      });
    });

    it('should throw ForbiddenException if email already exists', async () => {
      // Criamos uma instância real do erro que o Prisma lançaria
      const prismaError = new PrismaClientKnownRequestError('Message', {
        code: 'P2002',
        clientVersion: '7.2.0',
      });

      (prisma.user.create as jest.Mock).mockRejectedValue(prismaError);

      await expect(service.signUp(dto)).rejects.toThrow(ForbiddenException);
      await expect(service.signUp(dto)).rejects.toThrow('Email already exists');
    });
  });

  describe('signIn', () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return access token and user info on valid credentials', async () => {
      const user = {
        id: '1',
        email: dto.email,
        name: 'Test User',
        password: 'hashed_password',
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (argon.verify as jest.Mock).mockResolvedValue(true);
      (jwt.signAsync as jest.Mock).mockResolvedValue('token');

      const result = await service.signIn(dto);

      expect(result).toHaveProperty('access_token');
      expect(result.user.email).toEqual(dto.email);
      expect((result.user as any).password).toBeUndefined();
    });

    it('should throw ForbiddenException on invalid email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.signIn(dto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException on invalid password', async () => {
      const user = {
        id: '1',
        email: dto.email,
        name: 'Test User',
        password: 'hashed_password',
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (argon.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn(dto)).rejects.toThrow(ForbiddenException);
    });
  });
});
