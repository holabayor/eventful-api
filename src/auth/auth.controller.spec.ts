import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from '../users/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn((dto: CreateUserDto) =>
        Promise.resolve({
          _id: 'someid',
          email: dto.email,
          name: dto.name,
          role: dto.role,
          events: [],
        } as User),
      ),
      login: jest.fn((dto: LoginUserDto) =>
        Promise.resolve({
          token: 'adnjc',
          user: { email: dto.email } as User,
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123456',
        role: 'user',
      };
      const result = await controller.register(createUserDto);

      expect(result).toHaveProperty('data');
      expect(result.data).not.toHaveProperty('password');
      expect(result).toHaveProperty('message');

      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should successfully log in a user', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: '123456',
      };
      const result = await controller.login(loginUserDto);

      expect(result.data).toHaveProperty('token');
      expect(result.data.user).not.toHaveProperty('password');
      expect(mockAuthService.login).toHaveBeenCalledWith(loginUserDto);
    });
  });
});
