import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SystemMessages } from '../common/constants/system-messages';
import { FindAllResult } from '../common/interfaces';
import { CombinedLogger } from '../common/logger/combined.logger';
import { RedisService } from '../common/redis/redis.service';
import { NotificationsService } from '../notifications/notifications.service';
import { QRCodeService } from '../qrcode/qrcode.service';
import { TicketService } from '../ticket/ticket.service';
import { UserService } from '../users/user.service';
import { CreateEventDto, QueryEventsDto, UpdateEventDto } from './dto';
import { Event } from './events.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    private readonly logger: CombinedLogger,
    private readonly qrService: QRCodeService,
    @Inject(forwardRef(() => UserService))
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
    this.logger.log('Creating a new event');
    try {
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

      const event = await this.eventModel.create({
        ...createEventDto,
        creator: creatorId,
        eventDateTime,
      });

      // Create a QR code for the event
      event.eventQrCode = await this.qrService.handleQRCode(
        `event:${event.id}`,
      );
      await event.save();
      await this.redisService.set(`event:${event.id}`, event);

      return event;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(SystemMessages.EVENT_DUPLICATE_TITLE);
      }
      throw error;
    }
  }

  async findAll(queryEventsDto: QueryEventsDto): Promise<FindAllResult> {
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
    await this.redisService.del(cacheKey);
    const cachedEvents = await this.redisService.get(cacheKey);
    if (cachedEvents) {
      this.logger.log('All events fetched from cache');
      return cachedEvents;
    }

    const events = await this.eventModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ [queryEventsDto.sortBy]: order })
      .exec();

    const totalCount = await this.eventModel.countDocuments(query).exec();
    const totalPages = Math.ceil(totalCount / limit);
    const metadata = {
      page,
      limit,
      totalPages,
      totalCount,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };

    const data = { events, metadata };
    await this.redisService.set(cacheKey, data);

    this.logger.log('Events fetched from the database and cached');
    return data;
  }

  async findCreatorEvents(
    creatorId: Types.ObjectId,
    queryEventsDto?: QueryEventsDto,
  ): Promise<FindAllResult> {
    this.logger.log('Fetching creator events');
    const query = { creator: creatorId };

    if (queryEventsDto.title) {
      query['title'] = { $regex: new RegExp(queryEventsDto.title, 'i') };
    }

    const order = queryEventsDto.sort === 'desc' ? -1 : 1;
    const limit = queryEventsDto.limit || 10;
    const page = queryEventsDto.page || 1;
    const skip = (page - 1) * limit;

    const cacheKey = `creatorEvents:${creatorId}:${JSON.stringify(queryEventsDto)}`;
    const cachedEvents = await this.redisService.get(cacheKey);
    if (cachedEvents) {
      this.logger.log('Creator events fetched from cache');
      return cachedEvents;
    }

    const events = await this.eventModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ [queryEventsDto.sortBy]: order })
      .exec();

    const totalCount = await this.eventModel.countDocuments(query).exec();
    const totalPages = Math.ceil(totalCount / limit);
    const metadata = {
      page,
      limit,
      totalPages,
      totalCount,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };

    const data = { events, metadata };
    await this.redisService.set(cacheKey, data);

    this.logger.log('Creator events fetched from database and cached');
    return data;
  }

  async findById(id: Types.ObjectId): Promise<Event> {
    this.logger.log(`Fetching event by id: ${id}`);
    const cacheKey = `event:${id}`;
    const cachedEvent = await this.redisService.get(cacheKey);
    // await this.redisService.del(cacheKey);
    if (cachedEvent) {
      this.logger.log(`Event ${id} fetched from cache`);
      return cachedEvent;
    }

    const event = await this.eventModel
      .findById(id)
      .populate('attendees')
      .exec();
    if (!event) {
      this.logger.warn(`Event ${id} not found`);
      throw new NotFoundException(SystemMessages.EVENT_NOT_FOUND);
    }

    await this.redisService.set(cacheKey, event);

    this.logger.log(`Event ${id} found in the database`);
    return event;
  }

  async update(
    userId: Types.ObjectId,
    id: Types.ObjectId,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    this.logger.log(`Updating event ${id} for user ${userId}`);

    const updatedEvent = await this.eventModel
      .findOneAndUpdate(
        { _id: id, creator: userId },
        { $set: updateEventDto },
        {
          new: true,
        },
      )
      .exec();

    if (!updatedEvent) {
      this.logger.warn(`Update forbidden for event ${id} by user ${userId}`);
      throw new ForbiddenException(SystemMessages.FORBIDDEN);
    }

    await this.updateCache(id, updatedEvent);

    this.logger.log(`Event ${id} updated successfully`);
    return updatedEvent;
  }

  async delete(userId: Types.ObjectId, id: Types.ObjectId): Promise<boolean> {
    this.logger.log(`Attemptiing to delete event ${id} by user ${userId}`);

    const event = await this.eventModel.findById(id).exec();

    if (!event) {
      this.logger.warn(`Event ${id} not found`);
      throw new NotFoundException(SystemMessages.EVENT_NOT_FOUND);
    }

    console.log('Equals = ', event.creator.equals(userId));

    if (!event.creator.equals(userId)) {
      this.logger.warn(`Delete forbidden for event ${id} by user ${userId}`);
      throw new ForbiddenException(SystemMessages.FORBIDDEN);
    }

    const result = await this.eventModel.deleteOne({ _id: id }).exec();

    this.logger.log(`Event ${userId} deleted successfully`);
    return !!result;
  }

  async addAttendee(userId: Types.ObjectId, eventId: Types.ObjectId) {
    this.logger.log(`Adding attendee ${userId} to event ${eventId}`);
    const event = await this.eventModel.findById(eventId).exec();

    if (!event) {
      this.logger.warn(`Event ${eventId} not found`);
      throw new NotFoundException(SystemMessages.EVENT_NOT_FOUND);
    }

    if (new Date() > event.eventDateTime) {
      this.logger.warn(`Attempt to join past event ${eventId}`);
      throw new BadRequestException(SystemMessages.EVENT_PAST_EVENT);
    }

    if (event.creator.equals(userId)) {
      this.logger.warn(`User ${userId} is the creator of event ${eventId}`);
      throw new BadRequestException(SystemMessages.EVENT_CANNOT_REGISTER);
    }

    if (event.attendees.includes(userId)) {
      this.logger.warn(
        `User ${userId} already registered for event ${eventId}`,
      );
      throw new BadRequestException(SystemMessages.EVENT_ALREADY_REGISTERED);
    }
    event.attendees.push(userId);
    await event.save();

    const ticket = await (
      await this.ticketService.create(eventId, userId)
    ).populate('event');

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

    this.logger.log(
      `Attendee ${userId} added to event ${eventId} successfully`,
    );
    return ticket;
  }

  async getEventTickets(eventId: Types.ObjectId) {
    return this.ticketService.getEventTickets(eventId);
  }

  async verifyQRCode(eventId: Types.ObjectId, qrCode: string) {
    this.logger.log(`Verifying QR code for event ${eventId} and ${qrCode}`);
    // return await this.ticketService.verifyTicketQRCode(eventId, qrCode);
  }

  async updateCache(id: Types.ObjectId, event: Event) {
    this.redisService.set(`event:${id}`, event);
  }
}
