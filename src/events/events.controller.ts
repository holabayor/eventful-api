import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { GetUser, Roles } from '../auth/decorator';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Role } from '../auth/guard/roles';
import { SystemMessages } from '../common/constants/system-messages';
import { paramsIdDto } from '../common/dto/params-id.dto';
import { CreateEventDto, QueryEventsDto, UpdateEventDto } from './dto';
import { EventsService } from './events.service';

@ApiBearerAuth()
@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an event' })
  @ApiResponse({ status: 20, description: 'Event created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Creator)
  async create(
    @GetUser('id') userId: Types.ObjectId,
    @Body() createEventDto: CreateEventDto,
  ) {
    const event = await this.eventsService.create(userId, createEventDto);
    return { message: SystemMessages.EVENT_CREATE_SUCCESS, event };
  }

  @Get()
  @ApiOperation({ summary: 'Get all available events' })
  @ApiResponse({ status: 200, description: 'Event created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAll(@Query() queryEventsDto: QueryEventsDto) {
    const data = await this.eventsService.findAll(queryEventsDto);
    const message = data.events.length
      ? SystemMessages.EVENT_RETRIEVE_SUCCESS
      : SystemMessages.EVENT_NOT_FOUND;
    return {
      message,
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({ status: 200, description: 'Event created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findById(@Param() params: paramsIdDto) {
    const event = await this.eventsService.findById(params.id);
    return { message: SystemMessages.EVENT_RETRIEVE_SUCCESS, event };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({ status: 200, description: 'Event update successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Creator)
  async update(
    @GetUser('id') userId: Types.ObjectId,
    @Param() params: paramsIdDto,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const event = await this.eventsService.update(
      userId,
      params.id,
      updateEventDto,
    );
    return { message: SystemMessages.EVENT_UPDATE_SUCCESS, event };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 204, description: 'Delete event' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Creator)
  @HttpCode(204)
  remove(@GetUser('id') userId: Types.ObjectId, @Param() params: paramsIdDto) {
    return this.eventsService.delete(userId, params.id);
  }

  @Post(':id/attend')
  @ApiOperation({ summary: 'Register to attend an event' })
  @ApiResponse({ status: 200, description: 'Successful, ticket sent to mail' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Eventee)
  @HttpCode(200)
  async addAttendee(
    @GetUser('id') userId: Types.ObjectId,
    @Param() params: paramsIdDto,
  ) {
    const data = await this.eventsService.addAttendee(userId, params.id);
    return { message: SystemMessages.EVENT_REGISTER_SUCCESS, data };
  }

  @Get(':id/tickets')
  @ApiOperation({ summary: 'View all tickets an event' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Creator)
  async getEventTickets(@Param() params: paramsIdDto) {
    const tickets = await this.eventsService.getEventTickets(params.id);
    return { message: SystemMessages.TICKET_RETRIEVE_SUCCESS, tickets };
  }
}
