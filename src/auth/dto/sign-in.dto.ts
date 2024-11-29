import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsEmail({}, { message: 'Incorrect email format' })
  email: string;

  @IsNotEmpty()
  password: string;
}
