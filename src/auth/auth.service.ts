import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignInDto, SignUpDto } from './dto';
import { MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';
import { IFingerprint } from 'nestjs-fingerprint';
import { Session, User } from '../entities';
import { CryptoService, JwtService } from '../services';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly mailerService: MailerService,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpData: SignUpDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: signUpData.email,
      },
    });

    if (!user) {
      const salt = await this.cryptoService.genSalt(
        parseInt(process.env.SECRET_SALT),
      );
      const hashPassword = await this.cryptoService.hash(
        signUpData.password,
        salt,
      );

      const newUser = await this.userRepository.save({
        ...signUpData,
        password: hashPassword,
      });

      await this.mailerService.sendMail({
        to: newUser.email,
        from: process.env.EMAIL_USER,
        subject: '🍕 Регистрация в приложение Max Pizza',
        template: join(__dirname, 'templates', 'registration'),
        context: {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          url: `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/auth/confirm/${newUser.id}`,
        },
      });

      return newUser;
    } else {
      throw Error('Данный пользователь уже зарегистрирован!');
    }
  }

  async confirm(id: string) {
    this.userRepository.update(id, {
      isRegistrationComplete: true,
    });
  }

  async signIn(signInData: SignInDto, fingerprint: IFingerprint) {
    const user = await this.userRepository.findOne({
      where: {
        email: signInData.email,
      },
    });

    if (user) {
      if (user.isRegistrationComplete) {
        const isEqually = await this.cryptoService.compare(
          signInData.password,
          user.password,
        );

        if (isEqually) {
          const accessToken = this.jwtService.sign(
            { id: user.id },
            process.env.SECRET_ACCESS_TOKEN,
            {
              expiresIn: '2h',
            },
          );

          const refreshToken = this.jwtService.sign(
            { id: user.id },
            process.env.SECRET_REFRESH_TOKEN,
          );

          await this.sessionRepository.save([
            {
              accessToken,
              refreshToken,
              fingerprint: JSON.stringify(fingerprint),
              user: {
                ...user,
              },
            },
          ]);

          return { accessToken, refreshToken };
        } else {
          throw Error('Incorrect password');
        }
      } else {
        throw Error('User registration is not completed');
      }
    } else {
      throw Error('The user doesn`t exist');
    }
  }

  async signOut(authorization: string, fingerprint: IFingerprint) {
    const accessToken = authorization.replace('Bearer ', '');

    const session = await this.sessionRepository.findOne({
      where: {
        accessToken,
      },
    });

    const fingerprintSession: IFingerprint = JSON.parse(session.fingerprint);

    if (fingerprintSession.id === fingerprint.id) {
      await this.sessionRepository.remove([session]);
    } else {
      throw Error('The current session doesn`t match');
    }
  }

  async refershToken(authorization: string) {
    const refreshToken = authorization.replace('Bearer ', '');

    const session = await this.sessionRepository.findOne({
      where: {
        refreshToken,
      },
      relations: {
        user: true,
      },
    });

    if (session) {
      const newAccessToken = this.jwtService.sign(
        { id: session.user.id },
        process.env.SECRET_ACCESS_TOKEN,
        {
          expiresIn: '2h',
        },
      );

      await this.sessionRepository.update(session.id, {
        ...session,
        accessToken: newAccessToken,
      });

      return { accessToken: newAccessToken };
    } else {
      throw Error('The current session doesn`t match');
    }
  }
}
