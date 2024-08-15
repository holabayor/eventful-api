import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { IsFutureDate, IsValidTime } from '../../common/validators';

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
  readonly date: string;

  @IsString()
  readonly imageUrl: string;

  @IsString()
  @IsValidTime()
  time: string;

  @IsString()
  @IsNotEmpty()
  readonly location: string;

  @IsDateString()
  @IsOptional()
  defaultReminderDate?: string;

  @IsString()
  @IsOptional()
  readonly additionalDetails: string;
}
