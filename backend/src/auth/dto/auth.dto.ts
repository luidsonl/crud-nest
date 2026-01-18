import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Match } from '../validators/match.validator';

export class SignUpDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @Match('password', { message: 'Passwords do not match' })
    confirmPassword: string;

    @IsString()
    @IsNotEmpty()
    name: string;
}

export class SignInDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class UserDTO {
    id: string;
    email: string;
    name: string;
}