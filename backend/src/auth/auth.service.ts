import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private prismaService: PrismaService){}

    async signUp(){
       return 'User signed up';
    }

    async signIn(){
        return 'User signed in';
    }

}
