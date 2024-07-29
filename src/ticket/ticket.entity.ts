import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Event } from 'src/events/events.entity';
import { User } from 'src/users/user.entity';

@Schema()
export class Ticket extends Document {
  @Prop({ type: String, ref: Event.name })
  event: string;

  @Prop({ type: String, ref: User.name })
  user: string;

  @Prop({ type: String, required: true })
  qrCode: string;

  @Prop({
    required: true,
    default: 'purchased',
    enum: ['purchased', 'scanned', 'cancelled'],
  })
  status: string;

  @Prop({ type: Date, default: Date.now })
  purchasedAt: Date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
