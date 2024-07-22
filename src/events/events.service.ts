import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto, UpdateEventDto } from './dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from './events.entity';
import { UserService } from 'src/users/user.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    private readonly userService: UserService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, createEventDto: CreateEventDto): Promise<Event> {
    try {
      const event = new this.eventModel({ ...createEventDto, creator: userId });
      await event.save();
      return event;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Event with same title already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<Event[]> {
    const events = await this.eventModel.find().exec();
    return events;
  }

  async findById(id: string): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event not found`);
    }
    return event;
  }

  async update(
    userId: string,
    eventId: string,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    const event = await this.findById(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creator.toString() !== userId) {
      throw new ForbiddenException('You are not authorized');
    }

    return await this.eventModel
      .findByIdAndUpdate(eventId, updateEventDto, { new: true })
      .exec();
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const event = await this.findById(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creator.toString() !== userId) {
      throw new ForbiddenException('You are not authorized');
    }
    const result = await this.eventModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async addAttendee(userId: string, eventId: string) {
    const event = await this.findById(eventId);

    event.attendees.push(userId);

    await event.save();

    const user = await this.userService.findById(userId);

    await this.notificationsService.createNotification({
      userId,
      email: user.email,
      eventId,
      eventTitle: event.title,
      reminderDate: event.reminderDate,
    });

    return event;
  }
}
