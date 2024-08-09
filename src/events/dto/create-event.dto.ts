import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { IsFutureDate, IsValidTime } from 'src/common/validators';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsNotEmpty()
  readonly category: Types.ObjectId;

  @IsDateString()
  @IsFutureDate()
  @IsNotEmpty({ message: 'Date must be in the YYYY-MM-DD format' })
  readonly date: Date;

  @IsString()
  @IsValidTime()
  time: string;

  @IsString()
  @IsNotEmpty()
  readonly location: string;

  @IsDateString()
  @IsOptional()
  defaultReminderDate?: string;
}
