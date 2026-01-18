import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private jwt: JwtService,
        private readonly config: ConfigService
    ) {}

    async signUp(dto: SignUpDto) {
        try {
            const hash = await argon.hash(dto.password);
            return await this.prismaService.user.create({
                data: { email: dto.email, name: dto.name, password: hash }
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ForbiddenException('Email already exists');
            }
            throw error;
        }
    }

    async signIn(dto: SignInDto) {
        const user = await this.prismaService.user.findUnique({
            where: { email: dto.email },
            select: { id: true, email: true, name: true, password: true }
        });

        if (!user) throw new ForbiddenException('Credentials incorrect');

        const pwMatches = await argon.verify(user.password, dto.password);
        if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

        const { password, ...userWithoutPassword } = user;
        const access_token = await this.generateJwtToken(user.id, user.email);

        return { access_token, user: userWithoutPassword };
    }

    async generateJwtToken(userId: string, email: string): Promise<string> {
        const payload = { sub: userId, email };
        return await this.jwt.signAsync(payload, {
            secret: this.config.get<string>('JWT_SECRET'),
            expiresIn: '15m',
        });
    }
}