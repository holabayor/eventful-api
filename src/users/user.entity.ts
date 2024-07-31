import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Event } from 'src/events/events.entity';

@Schema({
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    },
  },
})
export class User extends Document {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String, unique: true })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, default: 'eventee', enum: ['creator', 'eventee'] })
  role: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: Event.name }] })
  events: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
