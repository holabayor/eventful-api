import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document<Types.ObjectId>;

@Schema({ collection: 'events' })
export class Event {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: String })
  date: string;

  @Prop({ required: true, type: String })
  location: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
