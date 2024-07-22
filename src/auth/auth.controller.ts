import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LoginUserDto } from './dto/auth.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() AuthDto: CreateUserDto) {
    return this.authService.register(AuthDto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() AuthDto: LoginUserDto) {
    return this.authService.login(AuthDto);
  }
}
