import { PartialType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsFutureDate, IsValidTime } from 'src/common/validators';
import { Transform } from 'class-transformer';

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

export class QueryEventsDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value)) // Transform to Date object
  date?: Date;

  // @IsOptional()
  // @IsMongoId()
  // creator?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'], { message: 'Sort must be either "asc" or "desc"' })
  sort?: string = 'asc';

  @IsOptional()
  @IsString()
  @IsIn(['title', 'date', 'organizer'], {
    message: 'Sort field must be "title", "date", or "organizer"',
  })
  sortBy?: string = 'date';
}
