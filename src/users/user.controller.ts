import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { GetUser } from 'src/auth/decorator';
import { JwtAuthGuard } from 'src/auth/guard';
import { UserService } from './user.service';

@ApiBearerAuth()
@ApiTags('User')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current logged in user' })
  @ApiResponse({ status: 200, description: 'User retrieval successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getUser(@GetUser('id') id: Types.ObjectId) {
    const user = await this.userService.findById(id);
    return { message: 'User retrieval successful', user };
  }

  @Get('events')
  @ApiOperation({ summary: 'Get all events registered for by current user' })
  @ApiResponse({ status: 200, description: 'Successful retrieval' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAppliedEvents(@GetUser('id') userId: Types.ObjectId) {
    const events = await this.userService.getAppliedEvents(userId);
    return { message: 'Successful retrieval', events };
  }
}
