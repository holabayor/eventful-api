import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Event } from '../events/events.entity';
import { User } from '../users/user.entity';

export enum TicketStatus {
  PURCHASED = 'purchased',
  SCANNED = 'scanned',
  CANCELLED = 'cancelled',
}

@Schema({
  toJSON: {
    transform(doc, ret) {
      delete ret.__v;
      return ret;
    },
  },
})
export class Ticket extends Document {
  @Prop({ type: Types.ObjectId, ref: Event.name })
  event: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name })
  user: Types.ObjectId;

  @Prop({ type: String, required: true, unique: true })
  qrCode: string;

  @Prop({
    required: true,
    enum: TicketStatus,
    default: TicketStatus.PURCHASED,
  })
  status: TicketStatus;

  @Prop({ type: Date, default: Date.now })
  purchasedAt: Date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);

TicketSchema.index({ event: 1, user: 1 });
