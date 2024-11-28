import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto';
import { genSalt, hash } from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly mailerService: MailerService,
  ) {}

  async signUp(signUpData: SignUpDto) {
    const user = await this.usersRepository.findOne({
      where: {
        email: signUpData.email,
      },
    });

    if (!user) {
      const salt = await genSalt(parseInt(process.env.SECRET_SALT));
      const hashPassword = await hash(signUpData.password, salt);

      const newUser = await this.usersRepository.save({
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
    } else {
      throw Error('The current user is already registered');
    }
  }

  async confirm(id: string) {
    this.usersRepository.update(id, {
      isRegistrationComplete: true,
    });
  }
}
