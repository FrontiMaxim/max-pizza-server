import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Redirect,
} from '@nestjs/common';
import { SignUpDto } from './dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() signUpData: SignUpDto) {
    try {
      await this.authService.signUp(signUpData);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('confirm/:id')
  @Redirect(
    `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/auth/sign-in`,
  )
  async confirm(@Param() id: string) {
    await this.authService.confirm(id);
  }
}
