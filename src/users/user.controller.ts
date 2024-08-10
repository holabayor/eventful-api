import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { GetUser, Roles } from '../auth/decorator';
import { JwtAuthGuard } from '../auth/guard';
import { Role } from '../auth/guard/roles';
import { SystemMessages } from '../common/constants/system-messages';
import { QueryEventsDto } from '../events/dto';
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
    return { message: SystemMessages.USER_RETRIEVE_SUCCESS, user };
  }

  @Get('events')
  @ApiOperation({ summary: 'Get all events registered for by current user' })
  @ApiResponse({ status: 200, description: 'Successful retrieval' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  // @Roles(Role.Eventee)
  async getAppliedEvents(
    @GetUser('id') userId: Types.ObjectId,
    @Query() queryEventsDto: QueryEventsDto,
  ) {
    const data = await this.userService.getAppliedEvents(
      userId,
      queryEventsDto,
    );
    const message = data.events.length
      ? SystemMessages.EVENT_RETRIEVE_SUCCESS
      : SystemMessages.EVENT_NOT_FOUND;
    return { message, data };
  }

  @Get('created-events')
  @ApiOperation({ summary: 'Get all events created for by current user' })
  @ApiResponse({ status: 200, description: 'Successful retrieval' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Roles(Role.Creator)
  async getCreatorEvents(
    @GetUser('id') userId: Types.ObjectId,
    @Query() queryEventsDto: QueryEventsDto,
  ) {
    const data = await this.userService.getCreatorEvents(
      userId,
      queryEventsDto,
    );
    const message = data.events.length
      ? SystemMessages.EVENT_RETRIEVE_SUCCESS
      : SystemMessages.EVENT_NOT_FOUND;
    return { message, data };
  }
}
