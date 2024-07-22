import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  toJSON: {
    transform(doc, ret) {
      delete ret.__v;
      return ret;
    },
  },
})
export class Notification extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  eventId: string;

  @Prop({ required: true, type: String })
  eventTitle: string;

  @Prop({ required: true, type: String })
  reminderDate: string;

  @Prop({ required: true, enum: ['scheduled', 'sent'], default: 'scheduled' })
  status: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
