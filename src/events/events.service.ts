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
      // Combine date and time into a single Date object
      const eventDateTime = new Date(createEventDto.date);
      const [hours, minutes] = createEventDto.time.split(':');
      eventDateTime.setHours(parseInt(hours), parseInt(minutes));

      if (!createEventDto.defaultReminderDate) {
        // Set the default reminder date to 1 day before the event
        const defaultReminderDate = new Date(
          eventDateTime.getTime() - 24 * 60 * 60 * 1000,
        );
        createEventDto.defaultReminderDate = defaultReminderDate.toISOString();
      }

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
    id: string,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    const event = await this.eventModel
      .findOneAndUpdate(
        { id, creator: userId },
        { $set: updateEventDto },
        {
          new: true,
        },
      )
      .exec();

    if (!event) {
      throw new ForbiddenException('You are not authorized');
    }

    return event;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const result = await this.eventModel
      .findOneAndDelete({ id, creator: userId })
      .exec();

    if (!result) {
      throw new ForbiddenException('You are not authorized');
    }
    return !!result;
  }

  async addAttendee(userId: string, eventId: string) {
    const event = await this.findById(eventId);

    console.log('Event', event);
    if (!event.attendees) {
      event.attendees = new Set<string>();
    }

    event.attendees.add(userId);

    const user = await this.userService.findById(userId);

    await this.notificationsService.createNotification({
      userId,
      email: user.email,
      eventId,
      eventTitle: event.title,
      reminderDate: event.defaultReminderDate,
    });

    await event.save();
    return event;
  }
}
