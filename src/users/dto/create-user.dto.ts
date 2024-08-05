import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly name: string;

  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(6)
  readonly password: string;

  @ApiProperty({ enum: ['creator', 'eventee'] })
  @IsString()
  @IsOptional()
  @IsIn(['creator', 'eventee'])
  readonly role: string;
}
