import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as QRCode from 'qrcode';
import { SystemMessages } from 'src/common/constants/system-messages';
import { QRCodeService } from 'src/qrcode/qrcode.service';
import { Ticket, TicketStatus } from './ticket.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
    private readonly qrService: QRCodeService,
  ) {}

  async findTicketById(ticketId: Types.ObjectId) {
    const ticket = await this.ticketModel
      .findById(ticketId)
      .populate('event', '-_id title')
      .exec();
    if (!ticket) {
      throw new NotFoundException(SystemMessages.TICKET_NOT_FOUND);
    }
    return ticket;
  }

  async create(eventId: Types.ObjectId, userId: Types.ObjectId) {
    const ticket = new this.ticketModel({
      event: eventId,
      user: userId,
    });

    const qrCode = await QRCode.toDataURL(`ticket:-${ticket._id}`);
    const uploadImage = await this.qrService.uploadToCloudinary(qrCode);

    ticket.qrCode = uploadImage.secure_url;

    await ticket.save();
    return ticket;
  }

  async getTicketByEventAndUser(
    eventId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Ticket> {
    const ticket = await this.ticketModel
      .findOne({ event: eventId, user: userId })
      .exec();
    if (!ticket) {
      throw new NotFoundException(SystemMessages.TICKET_NOT_FOUND);
    }
    return ticket;
  }

  async getEventTickets(eventId: Types.ObjectId): Promise<Ticket[]> {
    const tickets = await this.ticketModel.find({ event: eventId }).exec();
    if (!tickets) {
      throw new NotFoundException(SystemMessages.TICKET_NOT_FOUND);
    }
    return tickets;
  }

  async verifyTicketQRCode(
    ticketId: Types.ObjectId,
  ): Promise<{ valid: boolean }> {
    const ticket = await this.ticketModel.findById(ticketId).exec();
    console.log(ticket);
    return { valid: !!ticket };
  }

  async scanTicket(userId: Types.ObjectId, ticketId: Types.ObjectId) {
    const ticket = await this.ticketModel
      .findById(ticketId)
      .populate('event')
      .exec();

    if (!ticket) {
      throw new NotFoundException(SystemMessages.TICKET_NOT_FOUND);
    }

    if ((ticket.event as any).creator !== userId) {
      throw new ForbiddenException(SystemMessages.EVENT_NOT_CREATOR);
    }

    if (ticket.status === TicketStatus.SCANNED) {
      throw new BadRequestException(SystemMessages.TICKET_ALREADY_SCANNED);
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      throw new BadRequestException(SystemMessages.TICKET_INVALID);
    }

    ticket.status = TicketStatus.SCANNED;
    await ticket.save();

    return ticket;
  }

  async cancelTicket(userId: Types.ObjectId, ticketId: Types.ObjectId) {
    const ticket = await this.ticketModel
      .findById(ticketId)
      .populate('event')
      .exec();
    if (!ticket) {
      throw new NotFoundException(SystemMessages.TICKET_NOT_FOUND);
    }

    if ((ticket.event as any).creator !== userId && ticket.user !== userId) {
      throw new ForbiddenException(SystemMessages.EVENT_NOT_CREATOR);
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      throw new BadRequestException(SystemMessages.TICKET_ALREADY_CANCELLED);
    }

    ticket.status = TicketStatus.CANCELLED;
    await ticket.save();

    return ticket;
  }
}
