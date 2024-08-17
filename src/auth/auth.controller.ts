import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SystemMessages } from '../common/constants/system-messages';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() AuthDto: CreateUserDto) {
    const data = await this.authService.register(AuthDto);
    return { message: SystemMessages.AUTH_REGISTER_SUCCESS, data };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() AuthDto: LoginUserDto) {
    const data = await this.authService.login(AuthDto);
    return { message: SystemMessages.AUTH_LOGIN_SUCCESS, data };
  }

  @Post('logout')
  @HttpCode(200)
  logout() {
    return;
  }
}
