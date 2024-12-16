import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Redirect,
  Headers,
  HttpCode,
} from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto';
import { AuthService } from './auth.service';
import { Fingerprint, IFingerprint } from 'nestjs-fingerprint';

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
  @Redirect()
  async confirm(@Param() id: string) {
    await this.authService.confirm(id);

    return { url: `${process.env.FRONT_HOST}/auth/confirm` };
  }

  @Post('sign-in')
  async signIn(
    @Body() signInData: SignInDto,
    @Fingerprint() fingerprint: IFingerprint,
  ) {
    try {
      const result = await this.authService.signIn(signInData, fingerprint);

      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('sign-out')
  @HttpCode(HttpStatus.OK)
  async signOut(
    @Fingerprint() fingerprint: IFingerprint,
    @Headers('authorization') authorization: string,
  ) {
    try {
      await this.authService.signOut(authorization, fingerprint);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Headers('authorization') authorization: string) {
    try {
      return await this.authService.refershToken(authorization);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
