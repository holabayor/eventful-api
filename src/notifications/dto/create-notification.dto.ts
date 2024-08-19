import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateNotificationDto {
  @IsNotEmpty()
  readonly userId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsNotEmpty()
  readonly eventId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  readonly eventTitle: string;

  @IsDateString()
  reminderDate: string;
}
