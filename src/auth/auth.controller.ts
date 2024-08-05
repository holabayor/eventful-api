import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() AuthDto: CreateUserDto) {
    const data = await this.authService.register(AuthDto);
    return { message: 'Signup successful', data };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() AuthDto: LoginUserDto) {
    const data = await this.authService.login(AuthDto);
    return { message: 'Login successful', data };
  }
}
