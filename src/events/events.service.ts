import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto, UpdateEventDto } from './dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from './events.entity';
import { UserService } from 'src/users/user.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { TicketService } from 'src/ticket/ticket.service';
import { QRCodeService } from 'src/qrcode/qrcode.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    private readonly qrService: QRCodeService,
    private readonly userService: UserService,
    private readonly notificationsService: NotificationsService,
    private readonly ticketService: TicketService,
  ) {}

  private parseDateTime(date: string, time: string): Date {
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
      // Combine date and time into a single Date object
      const eventDateTime = new Date(createEventDto.date);
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
      });

      // Create a QR code for the event
      event.eventQrCode = await this.qrService.generateQRCode(
        `event:${event.id}`,
      );

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
    const events = await this.eventModel
      .find()
      .populate('creator', 'name -_id')
      .exec();
    return events;
  }

  async findById(id: Types.ObjectId): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event not found`);
    }
    return event;
  }

  async update(
    userId: Types.ObjectId,
    id: Types.ObjectId,
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

    // Check if the user is already an attende
    if (event.attendees.includes(userId)) {
      throw new BadRequestException('User is already an attendee');
    }
    event.attendees.push(userId);

    const { qrCode } = await this.ticketService.create(eventId, userId);
    const user = await this.userService.findById(userId);
    this.notificationsService.sendTicketNotification(
      user.email,
      event.title,
      qrCode,
    );

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

  async verifyQRCode(eventId: string, qrCode: string) {
    this.ticketService.verifyTicketQRCode(eventId, qrCode);
  }
}
