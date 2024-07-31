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
  getUser(@GetUser('id') id: Types.ObjectId) {
    return this.userService.findById(id);
  }

  @Get('events')
  async getAppliedEvents(@GetUser('id') userId: Types.ObjectId) {
    const events = await this.userService.getAppliedEvents(userId);
    return { message: 'Successful retrieval', events };
  }
}
