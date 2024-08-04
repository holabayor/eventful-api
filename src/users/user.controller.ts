import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { Types } from 'mongoose';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getUser(@GetUser('id') id: Types.ObjectId) {
    const user = await this.userService.findById(id);
    return { message: 'User retreival successful', user };
  }

  @Get('events')
  async getAppliedEvents(@GetUser('id') userId: Types.ObjectId) {
    const events = await this.userService.getAppliedEvents(userId);
    return { message: 'Successful retrieval', events };
  }
}
