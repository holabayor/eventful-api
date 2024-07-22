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

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(Role.Creator)
  create(
    @GetUser('id') userId: string,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventsService.create(userId, createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.Creator)
  update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(userId, id, updateEventDto);
  }

  @Delete(':id')
  @Roles(Role.Creator)
  @HttpCode(204)
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.eventsService.delete(userId, id);
  }
}
