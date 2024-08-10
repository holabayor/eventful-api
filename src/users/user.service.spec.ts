import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { RedisService } from '../common/redis/redis.service';
import { EventsService } from '../events/events.service';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let model: Model<User>;
  let mockEventsService: Partial<EventsService>;
  let mockRedisService: Partial<RedisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            constructor: jest.fn().mockResolvedValue({}),
            findOne: jest.fn().mockResolvedValue({}),
            findById: jest.fn().mockResolvedValue({}),
          },
        },
        { provide: EventsService, useValue: mockEventsService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    // console.log('Servic is ', service);
    expect(service).toBeDefined();
    expect(model).toBeDefined();
  });

  // it('should create a user successully', async () => {
  //   const createUserDto: CreateUserDto = {
  //     email: 'testuser@mail.com',
  //     name: 'Test User',
  //     password: '123456',
  //     role: 'eventee',
  //   };

  //   const result = await service.create(createUserDto);

  //   console.log('User creation mockmodel', mockUserModel);

  //   expect(mockUserModel.new).toHaveBeenCalledWith(createUserDto);
  //   // expect(result).toEqual(expect.objectContaining())
  // });
});
