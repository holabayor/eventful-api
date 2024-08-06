import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CombinedLogger } from 'src/common/logger/combined.logger';
import { RedisService } from 'src/common/redis/redis.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { QRCodeService } from 'src/qrcode/qrcode.service';
import { TicketService } from 'src/ticket/ticket.service';
import { UserService } from 'src/users/user.service';
import { CreateEventDto, QueryEventsDto, UpdateEventDto } from './dto';
import { Event } from './events.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    private readonly logger: CombinedLogger,
    private readonly qrService: QRCodeService,
    private readonly userService: UserService,
    private readonly notificationsService: NotificationsService,
    private readonly ticketService: TicketService,
    private readonly redisService: RedisService,
  ) {
    this.logger.setContext(EventsService.name);
  }

  private parseDateTime(date: string | Date, time: string): Date {
    const eventDateTime = new Date(date);
    const [hours, minutes] = time.split(':');
    eventDateTime.setHours(parseInt(hours), parseInt(minutes));
    return eventDateTime;
  }

  async create(
    creatorId: Types.ObjectId,
    createEventDto: CreateEventDto,
  ): Promise<Event> {
    try {
      console.log('Create event dto', createEventDto);
      // Combine date and time into a single Date object
      const eventDateTime = this.parseDateTime(
        createEventDto.date,
        createEventDto.time,
      );
      const [hours, minutes] = createEventDto.time.split(':');
      eventDateTime.setHours(parseInt(hours), parseInt(minutes));

      createEventDto.time = createEventDto.time
        .replace(/\s+/g, '')
        .toUpperCase();

      if (!createEventDto.defaultReminderDate) {
        // Set the default reminder date to 1 day before the event
        const defaultReminderDate = new Date(
          eventDateTime.getTime() - 24 * 60 * 60 * 1000,
        );
        createEventDto.defaultReminderDate = defaultReminderDate.toISOString();
      }

      const event = new this.eventModel({
        ...createEventDto,
        creator: creatorId,
        eventDateTime,
      });

      // Create a QR code for the event
      event.eventQrCode = await this.qrService.generateQRCode(
        `event:${event.id}`,
      );
      await event.save();
      await this.redisService.set(`event:${event.id}`, event);

      return event;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Event with same title already exists');
      }
      throw error;
    }
  }

  async findAll(queryEventsDto: QueryEventsDto): Promise<{
    events: Event[];
    metadata: {
      page: number;
      limit: number;
      totalPages: number;
      totalCount: number;
      hasPreviousPage: boolean;
      hasNextPage: boolean;
    };
  }> {
    this.logger.log('Fetching events');
    const query = {};

    if (queryEventsDto.title) {
      query['title'] = { $regex: new RegExp(queryEventsDto.title, 'i') };
    }

    const order = queryEventsDto.sort === 'desc' ? -1 : 1;
    const limit = queryEventsDto.limit || 10;
    const page = queryEventsDto.page || 1;
    const skip = (page - 1) * limit;

    const cacheKey = `events:${JSON.stringify(queryEventsDto)}`;
    const cachedEvents = await this.redisService.get(cacheKey);
    if (cachedEvents) {
      return cachedEvents;
    }

    const events = await this.eventModel
      .find(query)
      .populate('creator', 'name -_id')
      .skip(skip)
      .limit(limit)
      .sort({ [queryEventsDto.sortBy]: order })
      .exec();

    const totalCount = await this.eventModel.countDocuments(query).exec();
    const totalPages = Math.ceil(totalCount / limit);
    const metadata = {
      page: page,
      limit: limit,
      totalPages: totalPages,
      totalCount: totalCount,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };

    const data = { events, metadata };
    await this.redisService.set(cacheKey, data);
    return data;
  }

  async findCreatorEvents(
    creatorId: Types.ObjectId,
    queryEventsDto?: QueryEventsDto,
  ): Promise<{
    events: Event[];
    metadata: {
      page: number;
      limit: number;
      totalPages: number;
      totalCount: number;
      hasPreviousPage: boolean;
      hasNextPage: boolean;
    };
  }> {
    this.logger.log('Fetching events');
    const query = {};

    query['creator'] = creatorId;

    if (queryEventsDto.title) {
      query['title'] = { $regex: new RegExp(queryEventsDto.title, 'i') };
    }

    const order = queryEventsDto.sort === 'desc' ? -1 : 1;
    const limit = queryEventsDto.limit || 10;
    const page = queryEventsDto.page || 1;
    const skip = (page - 1) * limit;

    const cacheKey = `events:${JSON.stringify(queryEventsDto)}`;
    const cachedEvents = await this.redisService.get(cacheKey);
    if (cachedEvents) {
      return cachedEvents;
    }

    const events = await this.eventModel
      .find(query)
      .populate('creator', 'name -_id')
      .skip(skip)
      .limit(limit)
      .sort({ [queryEventsDto.sortBy]: order })
      .exec();

    const totalCount = await this.eventModel.countDocuments(query).exec();
    const totalPages = Math.ceil(totalCount / limit);
    const metadata = {
      page: page,
      limit: limit,
      totalPages: totalPages,
      totalCount: totalCount,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };

    const data = { events, metadata };
    await this.redisService.set(cacheKey, data);
    return data;
  }

  async findById(id: Types.ObjectId): Promise<Event> {
    const cacheKey = `event:${id}`;
    const cachedEvent = await this.redisService.get(cacheKey);
    // await this.redisService.del(cacheKey);
    if (cachedEvent) {
      return cachedEvent;
    }

    const event = await this.eventModel
      .findById(id)
      .populate('attendees')
      .exec();
    if (!event) {
      throw new NotFoundException(`Event not found`);
    }

    this.logger.log(`Event ${id} found in the database`);

    await this.redisService.set(cacheKey, event);
    return event;
  }

  async update(
    userId: Types.ObjectId,
    id: Types.ObjectId,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    const updatedEvent = await this.eventModel
      .findOneAndUpdate(
        { id, creator: userId },
        { $set: updateEventDto },
        {
          new: true,
        },
      )
      .exec();

    if (!updatedEvent) {
      throw new ForbiddenException('You are not authorized');
    }

    await this.updateCache(id, updatedEvent);
    return updatedEvent;
  }

  async delete(userId: Types.ObjectId, id: Types.ObjectId): Promise<boolean> {
    const result = await this.eventModel
      .findOneAndDelete({ id, creator: userId })
      .exec();

    if (!result) {
      throw new ForbiddenException('You are not authorized');
    }
    return !!result;
  }

  async addAttendee(userId: Types.ObjectId, eventId: Types.ObjectId) {
    const event = await this.eventModel.findById(eventId).exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    console.log(
      `Today is ${new Date()} and event date is ${event.eventDateTime}./nIs date valid? ${new Date() > event.eventDateTime}`,
    );

    // Check if the event is in the past
    if (new Date() > event.eventDateTime) {
      throw new BadRequestException(
        'Cannot register for an event that has already passed',
      );
    }

    // Check if the user is already an attende
    if (event.attendees.includes(userId)) {
      throw new BadRequestException('User is already an attendee');
    }
    event.attendees.push(userId);
    await event.save();

    const ticket = await this.ticketService.create(eventId, userId);

    const user = await this.userService.findById(userId);
    user.events.push(eventId);
    await user.save();

    this.notificationsService.sendTicketNotification(
      user.email,
      event.title,
      ticket.qrCode,
    );

    await this.notificationsService.createNotification({
      userId,
      email: user.email,
      eventId,
      eventTitle: event.title,
      reminderDate: event.defaultReminderDate,
    });

    return ticket;
  }

  async verifyQRCode(eventId: string, qrCode: string) {
    this.ticketService.verifyTicketQRCode(eventId, qrCode);
  }

  async updateCache(id: Types.ObjectId, event: Event) {
    this.redisService.set(`event:${id}`, event, 3600);
  }
}
