import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  toJSON: {
    transform(doc, ret) {
      delete ret.__v;
      return ret;
    },
  },
})
export class Event extends Document {
  @Prop({ required: true, type: String, unique: true, trim: true })
  title: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: String })
  date: string;

  @Prop({ required: true, type: String })
  time: string;

  @Prop({ required: true, type: String })
  location: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creator: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  attendees: Types.ObjectId[];

  @Prop({ type: String })
  eventQrCode: string;

  @Prop({ type: String })
  defaultReminderDate: string;

  @Prop({ type: Date })
  eventDateTime: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
