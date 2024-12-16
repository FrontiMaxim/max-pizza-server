import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Cart,
  Category,
  Ingredient,
  Order,
  Product,
  Session,
  User,
  Variant,
} from './entities';
import { AuthModule } from './auth';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { NestjsFingerprintModule } from 'nestjs-fingerprint';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        Product,
        Category,
        Ingredient,
        Variant,
        Cart,
        User,
        Order,
        Session,
      ],
      synchronize: true,
    }),
    AuthModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      template: {
        dir: join(__dirname, '/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    NestjsFingerprintModule.forRoot({
      params: ['headers', 'userAgent', 'ipAddress'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
