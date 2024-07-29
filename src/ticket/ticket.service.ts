import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Ticket } from './ticket.entity';
import { Model, Types } from 'mongoose';
import * as QRCode from 'qrcode';

@Injectable()
export class TicketService {
  constructor(@InjectModel(Ticket.name) private ticketModel: Model<Ticket>) {}

  async create(eventId: Types.ObjectId, userId: Types.ObjectId) {
    const qrCode = await QRCode.toDataURL(`${eventId}-${userId}`);

    const ticket = new this.ticketModel({
      event: eventId,
      user: userId,
      qrCode,
    });

    await ticket.save();
    return ticket;
  }

  async getTicketByEventAndUser(
    eventId: string,
    userId: string,
  ): Promise<Ticket> {
    const ticket = await this.ticketModel
      .findOne({ event: eventId, user: userId })
      .exec();
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async verifyTicketQRCode(
    eventId: string,
    qrCode: string,
  ): Promise<{ valid: boolean }> {
    const ticket = await this.ticketModel
      .findOne({ event: eventId, qrCode })
      .exec();
    return { valid: !!ticket };
  }
}
