import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class paramsIdDto {
  @IsMongoId({ message: 'Invalid ID format' })
  readonly id: Types.ObjectId;
}
