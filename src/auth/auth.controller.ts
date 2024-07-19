import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LoginUserDto } from './dto/auth.dto';
import { UserService } from 'src/users/user.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }
}
