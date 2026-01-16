import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import * as argon from 'argon2'

@Injectable()
export class AuthService {
    constructor(private prismaService: PrismaService){}

    async signUp(dto: SignUpDto){
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
    }

    async signIn(dto: SignInDto){
        return 'User signed in';
    }

}
