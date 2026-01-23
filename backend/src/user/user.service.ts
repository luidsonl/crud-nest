import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: string) {
        return this.prisma.user.findUnique({
            where: { id }
        });
    }

    async editUser(userId: string, dto: EditUserDto) {
        const data: any = {};
        if (dto.email) data.email = dto.email;
        if (dto.name) data.name = dto.name;
        if (dto.password) {
            data.password = await argon.hash(dto.password);
        }

        const user = await this.prisma.user.update({
            where: { id: userId },
            data
        });

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

