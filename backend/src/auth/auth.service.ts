import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthResponseDto, SignInDto, SignUpDto } from './dto';
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';

@Injectable()
export class AuthService {
    constructor(private prismaService: PrismaService){}

    async signUp(dto: SignUpDto){

        try {
            const hash = await argon.hash(dto.password);
            const user = await this.prismaService.user.create({
                data: {
                    email: dto.email,
                    name: dto.name,
                    password: hash,
                },
            });

            const userDto: AuthResponseDto= {
                id: user.id,
                email: user.email,
                name: user.name,
            };

            return userDto;
        } catch (error) {
            if(error instanceof PrismaClientKnownRequestError){
                if(error.code === 'P2002'){
                    throw new ForbiddenException('Email already exists');
                }
            }

            throw error;
        }

       
    }

    async signIn(dto: SignInDto){
        const user = await this.prismaService.user.findUnique({
            where: {
                email: dto.email,
            }, select: {id: true, email: true, name: true, password: true}
        });

        if(!user){
            throw new ForbiddenException('Credentials incorrect');
        }

        const pwMatches = await argon.verify(user.password, dto.password);

        if(!pwMatches){
            throw new ForbiddenException('Credentials incorrect');
        }

        const userDto: AuthResponseDto= {
            id: user.id,
            email: user.email,
            name: user.name,
        };

        return userDto;
    }

}
