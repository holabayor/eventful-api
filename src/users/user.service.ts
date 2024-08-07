import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SystemMessages } from 'src/common/constants/system-messages';
import { FindAllResult } from 'src/common/interfaces';
import { RedisService } from 'src/common/redis/redis.service';
import { QueryEventsDto } from 'src/events/dto';
import { Event } from 'src/events/events.entity';
import { EventsService } from 'src/events/events.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(forwardRef(() => EventsService))
    readonly eventService: EventsService,
    private readonly redisService: RedisService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = new this.userModel(createUserDto);
      await user.save();
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(SystemMessages.USER_EMAIL_EXISTS);
      }
      throw error;
    }
  }

  async findById(id: Types.ObjectId): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(SystemMessages.USER_NOT_FOUND);
    }
    return user;
  }

  async findByField(fieldName: keyof User, value: any): Promise<User> {
    const user = await this.userModel.findOne({ [fieldName]: value }).exec();
    if (!user) {
      throw new NotFoundException(SystemMessages.USER_NOT_FOUND);
    }
    return user;
  }

  async getAppliedEvents(
    userId: Types.ObjectId,
    queryEventsDto?: QueryEventsDto,
  ): Promise<FindAllResult> {
    const order = queryEventsDto.sort === 'desc' ? -1 : 1;
    const limit = queryEventsDto.limit || 10;
    const page = queryEventsDto.page || 1;
    const skip = (page - 1) * limit;

    const cacheKey = `events:${JSON.stringify(queryEventsDto)}`;
    await this.redisService.del(cacheKey);
    const cachedEvents = await this.redisService.get(cacheKey);
    if (cachedEvents) {
      console.log('cache hit');
      return cachedEvents;
    }

    const user = await this.userModel
      .findById(userId)
      .populate({ path: 'events', model: 'Event' })
      .skip(skip)
      .limit(limit)
      .sort({ [queryEventsDto.sortBy]: order })
      .exec();

    const events = user.events as unknown as Event[];

    const totalCount = user.events.length;
    const totalPages = Math.ceil(totalCount / limit);
    const metadata = {
      page: page,
      limit: limit,
      totalPages: totalPages,
      totalCount: totalCount,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };

    const data = { events, metadata };
    await this.redisService.set(cacheKey, data);
    return data;
  }

  async getCreatorEvents(
    creatorId: Types.ObjectId,
    queryEventsDto: QueryEventsDto,
  ): Promise<FindAllResult> {
    const data = await this.eventService.findCreatorEvents(
      creatorId,
      queryEventsDto,
    );
    // const user = await this.userModel
    //   .findById(creatorId)
    //   .populate({ path: 'events', model: 'Event' })
    //   .exec();
    // return user.events as unknown as Event[];
    return data;
  }
}
