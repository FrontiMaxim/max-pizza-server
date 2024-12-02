import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Session, User } from '../entities';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { SignUpDto } from './dto';

describe('AuthService', () => {
  let authService: AuthService;

  describe('Sign in with registration completed', () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [ConfigModule.forRoot()],
        providers: [
          AuthService,
          {
            provide: getRepositoryToken(User),
            useValue: {
              findOne: jest
                .fn<
                  Promise<User>,
                  [{ where: { email: string } }],
                  AuthService
                >()
                .mockImplementation(
                  (args) =>
                    new Promise((resolve) => {
                      const email = args.where.email;

                      if (email === 'test@test.com')
                        resolve({
                          id: '0',
                          email: 'test@test.com',
                          firstName: 'test',
                          lastName: 'test',
                          password:
                            '$2a$04$yuWHxqZ1X86y1lawiSB4b.BUEbKW7rir3HOG3h1RAtpxnHfA7FoLu',
                          isRegistrationComplete: true,
                          createdAt: new Date(),
                          updatedAt: new Date(),
                          carts: [],
                          sessions: [],
                        });

                      resolve(null);
                    }),
                ),
            },
          },
          {
            provide: getRepositoryToken(Session),
            useValue: {
              save: jest.fn(),
            },
          },
          {
            provide: MailerService,
            useValue: {},
          },
        ],
      }).compile();

      authService = moduleRef.get(AuthService);
    });

    it('should return access token and refresh token', async () => {
      const result = await authService.signIn(
        { email: 'test@test.com', password: 'dewdwef' },
        null,
      );

      expect(Object.keys(result).sort()).toEqual(
        ['accessToken', 'refreshToken'].sort(),
      );
    });

    it('should return error "The user doesn`t exist"', async () => {
      expect(
        authService.signIn(
          { email: 'test@test.ru', password: 'dewdwef' },
          null,
        ),
      ).rejects.toThrow('The user doesn`t exist');
    });

    it('should return error "Incorrect password"', async () => {
      expect(
        authService.signIn(
          { email: 'test@test.com', password: 'ewdwef' },
          null,
        ),
      ).rejects.toThrow('Incorrect password');
    });
  });

  describe('Sign in with registration not completed', () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [ConfigModule.forRoot()],
        providers: [
          AuthService,
          {
            provide: getRepositoryToken(User),
            useValue: {
              findOne: jest
                .fn<
                  Promise<User>,
                  [{ where: { email: string } }],
                  AuthService
                >()
                .mockImplementation(
                  () =>
                    new Promise((resolve) => {
                      resolve({
                        id: '0',
                        email: 'test@test.com',
                        firstName: 'test',
                        lastName: 'test',
                        password:
                          '$2a$04$yuWHxqZ1X86y1lawiSB4b.BUEbKW7rir3HOG3h1RAtpxnHfA7FoLu',
                        isRegistrationComplete: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        carts: [],
                        sessions: [],
                      });
                    }),
                ),
            },
          },
          {
            provide: getRepositoryToken(Session),
            useValue: {
              save: jest.fn(),
            },
          },
          {
            provide: MailerService,
            useValue: {},
          },
        ],
      }).compile();

      authService = moduleRef.get(AuthService);
    });

    it('should return error "User registration is not completed"', async () => {
      expect(
        authService.signIn(
          { email: 'test@test.com', password: 'dewdwef' },
          null,
        ),
      ).rejects.toThrow('User registration is not completed');
    });
  });

  describe('Sign up', () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [ConfigModule.forRoot()],
        providers: [
          AuthService,
          {
            provide: getRepositoryToken(User),
            useValue: {
              save: jest
                .fn<Promise<User>, User[], AuthService>()
                .mockImplementation(
                  (signUpData: SignUpDto) =>
                    new Promise((resolve) =>
                      resolve({
                        ...signUpData,
                        id: '0',
                        password: 'hashPassword',
                        isRegistrationComplete: false,
                        createdAt: new Date('2024'),
                        updatedAt: new Date('2024'),
                        carts: [],
                        sessions: [],
                      }),
                    ),
                ),
              findOne: jest
                .fn<
                  Promise<User>,
                  [{ where: { email: string } }],
                  AuthService
                >()
                .mockImplementation(
                  (args) =>
                    new Promise((resolve) => {
                      const email = args.where.email;

                      if (email === 'test@test.ru') {
                        resolve({
                          id: '0',
                          firstName: 'firstName',
                          lastName: 'lastName',
                          email: 'test@test.ru',
                          password: 'hashPassword',
                          isRegistrationComplete: false,
                          createdAt: new Date('2024'),
                          updatedAt: new Date('2024'),
                          carts: [],
                          sessions: [],
                        });
                      } else {
                        resolve(null);
                      }
                    }),
                ),
            },
          },
          {
            provide: getRepositoryToken(Session),
            useValue: {},
          },
          {
            provide: MailerService,
            useValue: {
              sendMail: jest.fn(),
            },
          },
        ],
      }).compile();

      authService = moduleRef.get(AuthService);
    });

    it('should return new user', async () => {
      expect(
        await authService.signUp({
          email: 'test@test.com',
          password: 'dewdwef',
          firstName: 'firstName',
          lastName: 'lastName',
        }),
      ).toEqual({
        id: '0',
        email: 'test@test.com',
        firstName: 'firstName',
        lastName: 'lastName',
        password: 'hashPassword',
        isRegistrationComplete: false,
        createdAt: new Date('2024'),
        updatedAt: new Date('2024'),
        carts: [],
        sessions: [],
      });
    });

    it('should return error "The current user is already registered"', async () => {
      expect(
        authService.signUp({
          email: 'test@test.ru',
          password: 'dewdwef',
          firstName: 'firstName',
          lastName: 'lastName',
        }),
      ).rejects.toThrow('The current user is already registered');
    });
  });
});
