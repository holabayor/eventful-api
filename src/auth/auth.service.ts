import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SystemMessages } from 'src/common/constants/system-messages';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserService } from '../users/user.service';
import { LoginUserDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return user;
  }

  async login(dto: LoginUserDto) {
    const user = await this.userService.findByField('email', dto.email);

    if (!(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException(SystemMessages.AUTH_INVALID_CREDENTIALS);
    }
    const token = this.jwtService.sign(
      { userId: user.id, role: user.role },
      {
        expiresIn: '60m',
        secret: this.config.get('JWT_SECRET'),
      },
    );
    return { token, user };
  }
}
