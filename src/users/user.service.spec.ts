import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Model, Types } from 'mongoose';
import { User } from './user.entity';
import { getModelToken } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let model: Model<User>;

  const mockUserModel = {
    new: jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ ...dto, _id: new Types.ObjectId() }),
    })),

    findById: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    // console.log('Servic is ', service);
    expect(service).toBeDefined();
  });

  it('should create a user successully', async () => {
    const createUserDto: CreateUserDto = {
      email: 'testuser@mail.com',
      name: 'Test User',
      password: '123456',
      role: 'eventee',
    };

    const result = await service.create(createUserDto);

    console.log('User creation mockmodel', mockUserModel);

    expect(mockUserModel.new).toHaveBeenCalledWith(createUserDto);
    // expect(result).toEqual(expect.objectContaining())
  });
});
