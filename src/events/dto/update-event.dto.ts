import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {}

export class QueryEventsDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value)) // Transform to Date object
  date?: Date;

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
