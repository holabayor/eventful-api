import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, QueryEventsDto, UpdateEventDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { GetUser, Roles } from '../auth/decorator';
import { Role } from '../auth/guard/roles';
import { Types } from 'mongoose';
import { paramsIdDto } from 'src/common/dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
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
  async findById(@Param() params: paramsIdDto) {
    const event = await this.eventsService.findById(params.id);
    return { message: 'Event retrieval successful', event };
  }

  @Patch(':id')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Creator)
  @HttpCode(204)
  remove(@GetUser('id') userId: Types.ObjectId, @Param() params: paramsIdDto) {
    return this.eventsService.delete(userId, params.id);
  }

  @Post(':id/attend')
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
}
