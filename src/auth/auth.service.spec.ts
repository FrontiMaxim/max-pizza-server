import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Session, User } from '../entities';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { Repository } from 'typeorm';
import { CryptoService, JwtService } from '../services';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let sessionRepository: Repository<Session>;
  let cryptoService: CryptoService;
  let mailerService: MailerService;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockSessionRepository = {
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockCryptoService = {
    genSalt: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Session),
          useValue: mockSessionRepository,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: CryptoService,
          useValue: mockCryptoService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    sessionRepository = moduleRef.get<Repository<Session>>(
      getRepositoryToken(Session),
    );
    mailerService = moduleRef.get(MailerService);
    cryptoService = moduleRef.get(CryptoService);
    jwtService = moduleRef.get(JwtService);
  });

  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('Sign in with registration completed', () => {
    let mockUser: User;

    beforeAll(async () => {
      mockUser = {
        id: '0',
        email: 'test@test.com',
        firstName: 'Max',
        lastName: 'Fronti',
        password: 'hashPassword',
        isRegistrationComplete: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        carts: [],
        sessions: [],
      };
    });

    it('should return access token and refresh token', async () => {
      const mockFindOne = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser);
      const mockCompare = jest
        .spyOn(cryptoService, 'compare')
        .mockResolvedValue(true);
      const mockSign = jest.spyOn(jwtService, 'sign').mockReturnValue('token');
      const mockSave = jest.spyOn(sessionRepository, 'save');

      const result = await authService.signIn(
        { email: 'test@test.com', password: 'password' },
        null,
      );

      expect(mockFindOne).toHaveBeenCalled();
      expect(mockCompare).toHaveBeenCalled();
      expect(mockSign).toHaveBeenCalledTimes(2);
      expect(mockSave).toHaveBeenCalled();

      expect(result).toEqual({
        accessToken: 'token',
        refreshToken: 'token',
      });
    });

    it('should return error "The user doesn`t exist"', async () => {
      const mockFindOne = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(null);
      const mockCompare = jest.spyOn(cryptoService, 'compare');
      const mockSign = jest.spyOn(jwtService, 'sign');
      const mockSave = jest.spyOn(sessionRepository, 'save');

      expect(
        authService.signIn(
          { email: 'test@test.com', password: 'password' },
          null,
        ),
      ).rejects.toThrow('The user doesn`t exist');

      expect(mockFindOne).toHaveBeenCalled();
      expect(mockCompare).not.toHaveBeenCalled();
      expect(mockSign).not.toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();
    });

    it('should return error "Incorrect password"', async () => {
      const mockFindOne = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser);
      const mockCompare = jest
        .spyOn(cryptoService, 'compare')
        .mockResolvedValue(false);
      const mockSign = jest.spyOn(jwtService, 'sign');
      const mockSave = jest.spyOn(sessionRepository, 'save');

      expect(
        authService.signIn(
          { email: 'test@test.com', password: 'password' },
          null,
        ),
      ).rejects.toThrow('Incorrect password');

      expect(mockFindOne).toHaveBeenCalled();
      expect(mockCompare).toHaveBeenCalled();
      expect(mockSign).not.toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe('Sign in with registration not completed', () => {
    let mockUser: User;

    beforeAll(async () => {
      mockUser = {
        id: '0',
        email: 'test@test.com',
        firstName: 'Max',
        lastName: 'Fronti',
        password: 'hashPassword',
        isRegistrationComplete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        carts: [],
        sessions: [],
      };
    });

    it('should return error "User registration is not completed"', async () => {
      const mockFindOne = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser);
      const mockCompare = jest.spyOn(cryptoService, 'compare');
      const mockSign = jest.spyOn(jwtService, 'sign');
      const mockSave = jest.spyOn(sessionRepository, 'save');

      expect(
        authService.signIn(
          { email: 'test@test.com', password: 'password' },
          null,
        ),
      ).rejects.toThrow('User registration is not completed');

      expect(mockFindOne).toHaveBeenCalled();
      expect(mockCompare).not.toHaveBeenCalled();
      expect(mockSign).not.toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe('Sign up', () => {
    let mockUser: User;

    beforeAll(async () => {
      mockUser = {
        id: '0',
        email: 'test@test.com',
        firstName: 'Max',
        lastName: 'Fronti',
        password: 'hashPassword',
        isRegistrationComplete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        carts: [],
        sessions: [],
      };
    });

    it('should return new user', async () => {
      const mockFindOne = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(null);
      const mockSave = jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(mockUser);
      const mockGenSalt = jest.spyOn(cryptoService, 'genSalt');
      const mockHash = jest.spyOn(cryptoService, 'hash');
      const mockMailSend = jest.spyOn(mailerService, 'sendMail');

      const result = await authService.signUp({
        email: 'test@test.com',
        password: 'password',
        firstName: 'Max',
        lastName: 'Fronti',
      });

      expect(mockFindOne).toHaveBeenCalled();
      expect(mockGenSalt).toHaveBeenCalled();
      expect(mockHash).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(mockMailSend).toHaveBeenCalled();

      expect(result).toEqual(mockUser);
    });

    it('should return error "Данный пользователь уже зарегистрирован!"', async () => {
      const mockFindOne = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser);
      const mockSave = jest.spyOn(userRepository, 'save');
      const mockGenSalt = jest.spyOn(cryptoService, 'genSalt');
      const mockHash = jest.spyOn(cryptoService, 'hash');
      const mockMailSend = jest.spyOn(mailerService, 'sendMail');

      expect(
        authService.signUp({
          email: 'test@test.ru',
          password: 'password',
          firstName: 'Max',
          lastName: 'Fronti',
        }),
      ).rejects.toThrow('Данный пользователь уже зарегистрирован!');

      expect(mockFindOne).toHaveBeenCalled();
      expect(mockGenSalt).not.toHaveBeenCalled();
      expect(mockHash).not.toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();
      expect(mockMailSend).not.toHaveBeenCalled();
    });
  });
});
