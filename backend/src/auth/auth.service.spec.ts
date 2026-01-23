import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ForbiddenException } from "@nestjs/common";
import * as argon from "argon2";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';

jest.mock('argon2', () => ({
    hash: jest.fn(),
    verify: jest.fn(),
}));

describe("AuthService", () => {
    let service: AuthService;
    let prisma: PrismaService;
    let jwt: JwtService;
    let config: ConfigService;

    const mockPrismaService = {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
        },
    };

    const mockJwtService = {
        signAsync: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'JWT_SECRET') return 'test_secret';
            return null;
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get<PrismaService>(PrismaService);
        jwt = module.get<JwtService>(JwtService);
        config = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('signUp', () => {
        const dto = {
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
            confirmPassword: 'password123'
        };

        it('should create a new user', async () => {
            const hash = 'hashed_password';
            (argon.hash as jest.Mock).mockResolvedValue(hash);
            mockPrismaService.user.create.mockResolvedValue({
                id: '1',
                email: dto.email,
                name: dto.name,
                password: hash,
            });

            const result = await service.signUp(dto);

            expect(result).toBeDefined();
            expect(result.email).toEqual(dto.email);
            expect(mockPrismaService.user.create).toHaveBeenCalledWith({
                data: {
                    email: dto.email,
                    name: dto.name,
                    password: hash,
                }
            });
        });

        it('should throw ForbiddenException if email already exists', async () => {
            // Criamos uma instância real do erro que o Prisma lançaria
            const prismaError = new PrismaClientKnownRequestError('Message', {
                code: 'P2002',
                clientVersion: '7.2.0',
            });

            mockPrismaService.user.create.mockRejectedValue(prismaError);

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
            mockPrismaService.user.findUnique.mockResolvedValue(user);
            (argon.verify as jest.Mock).mockResolvedValue(true);
            mockJwtService.signAsync.mockResolvedValue('token');

            const result = await service.signIn(dto);

            expect(result).toHaveProperty('access_token');
            expect(result.user.email).toEqual(dto.email);
            expect((result.user as any).password).toBeUndefined();
        });

        it('should throw ForbiddenException on invalid email', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.signIn(dto)).rejects.toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException on invalid password', async () => {
            const user = {
                id: '1',
                email: dto.email,
                name: 'Test User',
                password: 'hashed_password',
            };
            mockPrismaService.user.findUnique.mockResolvedValue(user);
            (argon.verify as jest.Mock).mockResolvedValue(false);

            await expect(service.signIn(dto)).rejects.toThrow(ForbiddenException);
        });
    });
});