import { ConfigModule } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { Notification } from './notifications.entity';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let model: Model<Notification>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        NotificationsService,
        {
          provide: getModelToken(Notification.name),
          useValue: {
            create: jest.fn().mockResolvedValue({}),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    model = module.get<Model<Notification>>(getModelToken(Notification.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(model).toBeDefined();
  });
});
