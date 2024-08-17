import { ConfigModule } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { CombinedLogger } from '../common/logger/combined.logger';
import { Notification } from './notifications.entity';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let model: Model<Notification>;
  let schedulerRegistry: SchedulerRegistry;

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
        {
          provide: CombinedLogger,
          useValue: { log: jest.fn(), warn: jest.fn(), setContext: jest.fn() },
        },
        {
          provide: SchedulerRegistry,
          useValue: {
            addCronJob: jest.fn(),
            getCronJob: jest.fn(),
            deleteCronJob: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    model = module.get<Model<Notification>>(getModelToken(Notification.name));
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(model).toBeDefined();
    expect(schedulerRegistry).toBeDefined();
  });
});
