import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/user.entity';

@Schema({
  toJSON: {
    transform(doc, ret) {
      delete ret.__v;
      return ret;
    },
  },
})
export class Event extends Document {
  @Prop({ required: true, type: String, trim: true })
  title: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: String })
  date: string;

  @Prop({ required: true, type: String })
  time: string;

  @Prop({ required: true, type: String })
  location: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  creator: Types.ObjectId;

  // @Prop({ type: [{ type: Types.ObjectId, ref: User.name }] })
  // attendees: Types.ObjectId[];

  @Prop({ type: [String] })
  attendees: Set<string>;

  @Prop({ type: String })
  defaultReminderDate: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
