import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.entity';
import { Model } from 'mongoose';
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

  async findById(id: string): Promise<User | null> {
    return await this.userModel.findById(id).exec();
  }

  async findByField(fieldName: keyof User, value: any): Promise<User | null> {
    return await this.userModel.findOne({ [fieldName]: value }).exec();
  }
}
