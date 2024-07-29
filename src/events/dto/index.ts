import { PartialType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsFutureDate, IsValidTime } from 'src/common/validators';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

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

export class UpdateEventDto extends PartialType(CreateEventDto) {}
