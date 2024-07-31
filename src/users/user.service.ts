import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.entity';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = new this.userModel(createUserDto);
      await user.save();
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User with email already exists');
      }
      throw error;
    }
  }

  async findById(id: Types.ObjectId): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async findByField(fieldName: keyof User, value: any): Promise<User> {
    const user = await this.userModel.findOne({ [fieldName]: value }).exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async getAppliedEvents(userId: Types.ObjectId): Promise<Event[]> {
    const user = await this.userModel
      .findById(userId)
      .populate({ path: 'events', model: 'Event' })
      .exec();
    return user.events as unknown as Event[];
  }
}
