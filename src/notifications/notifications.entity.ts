import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/users/user.entity';

@Schema({
  toJSON: {
    transform(doc, ret) {
      delete ret.__v;
      return ret;
    },
  },
})
export class Notification extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  userId: Types.ObjectId;

  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: Types.ObjectId, ref: Event.name })
  eventId: Types.ObjectId;

  @Prop({ required: true, type: String })
  eventTitle: string;

  @Prop({ required: true, type: String })
  reminderDate: string;

  @Prop({ required: true, enum: ['scheduled', 'sent'], default: 'scheduled' })
  status: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
