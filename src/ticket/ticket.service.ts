import {
  BadRequestException,
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

  async create(eventId: Types.ObjectId, userId: Types.ObjectId) {
    const qrCode = await QRCode.toDataURL(`${eventId}-${userId}`);
    const uploadImage = await this.qrService.uploadToCloudinary(qrCode);

    const ticket = new this.ticketModel({
      event: eventId,
      user: userId,
      qrCode: uploadImage.secure_url,
    });

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
    eventId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<{ valid: boolean }> {
    const ticket = await this.ticketModel
      .findOne({ event: eventId, user: userId })
      .exec();
    console.log(ticket);
    return { valid: !!ticket };
  }

  async scanTicket(qrCode: string) {
    const ticket = await this.ticketModel.findOne({ qrCode }).exec();
    if (!ticket) {
      throw new NotFoundException(SystemMessages.TICKET_NOT_FOUND);
    }

    if (ticket.status === TicketStatus.SCANNED) {
      throw new BadRequestException(SystemMessages.TICKET_ALREADY_SCANNED);
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      throw new BadRequestException(SystemMessages.TICKET_ALREADY_CANCELLED);
    }

    ticket.status = TicketStatus.SCANNED;
    await ticket.save();

    return ticket;
  }

  async cancelTicket(qrCode: string) {
    const ticket = await this.ticketModel.findOne({ qrCode }).exec();
    if (!ticket) {
      throw new NotFoundException(SystemMessages.TICKET_NOT_FOUND);
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      throw new BadRequestException(SystemMessages.TICKET_ALREADY_CANCELLED);
    }

    if (ticket.status === TicketStatus.SCANNED) {
      throw new BadRequestException(SystemMessages.TICKET_ALREADY_SCANNED);
    }

    ticket.status = TicketStatus.SCANNED;
    await ticket.save();

    return ticket;
  }
}
