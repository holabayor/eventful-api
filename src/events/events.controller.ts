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
import { paramsIdDto } from 'src/common/dto/params-id.dto';
import { GetUser, Roles } from '../auth/decorator';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Role } from '../auth/guard/roles';
import { CreateEventDto, QueryEventsDto, UpdateEventDto } from './dto';
import { EventsService } from './events.service';

@ApiBearerAuth()
@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an event' })
  @ApiResponse({ status: 200, description: 'Event created' })
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
    return { message: 'Event created', event };
  }

  @Get()
  @ApiOperation({ summary: 'Events retrieval successful' })
  @ApiResponse({ status: 200, description: 'Event created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAll(@Query() queryEventsDto: QueryEventsDto) {
    const { events, metadata } =
      await this.eventsService.findAll(queryEventsDto);
    return {
      message: 'Events retrieval successful',
      events,
      metadata,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Event retrieval successful' })
  @ApiResponse({ status: 200, description: 'Event created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findById(@Param() params: paramsIdDto) {
    const event = await this.eventsService.findById(params.id);
    return { message: 'Event retrieval successful', event };
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
    return { message: 'Event update successful', event };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 204, description: 'Delete event' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Creator)
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
  @Roles(Role.Eventee)
  @HttpCode(200)
  async addAttendee(
    @GetUser('id') userId: Types.ObjectId,
    @Param() params: paramsIdDto,
  ) {
    const data = await this.eventsService.addAttendee(userId, params.id);
    return { message: 'Successful, ticket sent to mail', data };
  }

  @Get(':id/tickets')
  @ApiOperation({ summary: 'View all tickets an event' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Creator)
  async getEventTickets() {}
}
