import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// export type UserDocument = User & Document<Types.ObjectId>;

@Schema({ collection: 'users' })
export class User extends Document {
  @Prop({ required: true, type: String })
  firstName: string;

  @Prop({ required: true, type: String })
  lastName: string;

  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
