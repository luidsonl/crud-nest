import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
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
                select: {id: true, email: true, name: true}
            });
            return user;
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
        return 'User signed in';
    }

}
