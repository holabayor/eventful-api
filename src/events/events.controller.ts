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
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { GetUser, Roles } from '../auth/decorator';
import { Role } from '../auth/guard/roles';
import { Types } from 'mongoose';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(Role.Creator)
  async create(
    @GetUser('id') userId: Types.ObjectId,
    @Body() createEventDto: CreateEventDto,
  ) {
    const event = await this.eventsService.create(userId, createEventDto);
    return { message: 'Event created', event };
  }

  @Get()
  async findAll() {
    const events = await this.eventsService.findAll();
    return { message: 'Events retrieval successful', events };
  }

  @Get(':id')
  async findById(@Param('id') id: Types.ObjectId) {
    const event = await this.eventsService.findById(id);
    return { message: 'Event retrieval successful', event };
  }

  @Patch(':id')
  @Roles(Role.Creator)
  async update(
    @GetUser('id') userId: Types.ObjectId,
    @Param('id') eventId: Types.ObjectId,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const event = await this.eventsService.update(
      userId,
      eventId,
      updateEventDto,
    );
    return { message: 'Event update successful', event };
  }

  @Delete(':id')
  @Roles(Role.Creator)
  @HttpCode(204)
  remove(
    @GetUser('id') userId: Types.ObjectId,
    @Param('id') eventId: Types.ObjectId,
  ) {
    return this.eventsService.delete(userId, eventId);
  }

  @Post(':id/attend')
  @Roles(Role.Eventee)
  @HttpCode(200)
  async addAttendee(
    @GetUser('id') userId: Types.ObjectId,
    @Param('id') eventId: Types.ObjectId,
  ) {
    const event = await this.eventsService.addAttendee(userId, eventId);
    return { message: 'Successful', event };
  }
}
