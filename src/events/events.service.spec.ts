import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { CombinedLogger } from '../common/logger/combined.logger';
import { RedisService } from '../common/redis/redis.service';
import { NotificationsService } from '../notifications/notifications.service';
import { QRCodeService } from '../qrcode/qrcode.service';
import { TicketService } from '../ticket/ticket.service';
import { UserService } from '../users/user.service';
import { CreateEventDto } from './dto';
import { Event } from './events.entity';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;
  let model: Model<Event>;

  const mockEvent = {
    _id: new Types.ObjectId(),
    title: 'Test Event',
    description: 'This is a test event',
    date: '2024-10-08',
    time: '08:00am',
    location: 'Freedom Park',
    save: jest.fn().mockResolvedValue(undefined),
    populate: jest.fn().mockReturnThis(),
  };

  const mockQuery = {
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockEvent]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getModelToken(Event.name),
          useValue: {
            create: jest.fn().mockResolvedValue(mockEvent),
            findById: jest.fn(() => ({
              populate: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue(mockEvent),
            })),
            findOneAndUpdate: jest.fn().mockResolvedValue(mockEvent),
            deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
            find: jest.fn(() => mockQuery),
            countDocuments: jest.fn(() => ({
              exec: jest.fn().mockResolvedValue(100),
            })),
          },
        },
        {
          provide: CombinedLogger,
          useValue: { log: jest.fn(), warn: jest.fn(), setContext: jest.fn() },
        },
        { provide: QRCodeService, useValue: { handleQRCode: jest.fn() } },
        { provide: UserService, useValue: { findById: jest.fn() } },
        {
          provide: NotificationsService,
          useValue: {
            sendTicketNotification: jest.fn(),
            createNotification: jest.fn(),
          },
        },
        {
          provide: TicketService,
          useValue: {
            create: jest.fn(),
            getEventTickets: jest.fn(),
            verifyTicketQRCode: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    model = module.get<Model<Event>>(getModelToken(Event.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(model).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create an event', async () => {
      const eventDto: CreateEventDto = {
        title: 'Test Event',
        description: 'This is a test event',
        date: '2024-10-08',
        time: '08:00am',
        location: 'Freedom Park',
        category: new Types.ObjectId(),
      };

      const result = await service.create(new Types.ObjectId(), eventDto);

      expect(model.create).toHaveBeenCalled();
      expect(result).toHaveProperty('_id');
      expect(result).toEqual(mockEvent);
    });
  });

  describe('findAll', () => {
    it('should return all events', async () => {
      const queryEventsDto = {
        title: 'Test',
        sort: 'asc',
        limit: 10,
        page: 1,
        sortBy: 'date',
      };
      const result = await service.findAll(queryEventsDto);

      expect(model.find).toHaveBeenCalled();
      expect(mockQuery.skip).toHaveBeenCalledWith(
        (queryEventsDto.page - 1) * queryEventsDto.limit,
      );
      expect(mockQuery.limit).toHaveBeenCalledWith(queryEventsDto.limit);
      expect(mockQuery.sort).toHaveBeenCalledWith({
        [queryEventsDto.sortBy]: queryEventsDto.sort === 'desc' ? -1 : 1,
      });
      expect(result).toEqual({
        events: [mockEvent],
        metadata: expect.anything(),
      });
    });
  });

  describe('findById', () => {
    it('should return all events', async () => {
      const result = await service.findById(mockEvent._id);
      expect(model.findById).toHaveBeenCalledWith(mockEvent._id);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('findCreatorEvents', () => {
    it('should return all creators events', async () => {
      const queryEventsDto = {
        title: 'Test',
        sort: 'asc',
        limit: 10,
        page: 1,
        sortBy: 'date',
      };

      const creatorId = new Types.ObjectId();
      const result = await service.findCreatorEvents(creatorId, queryEventsDto);

      expect(model.find).toHaveBeenCalled();
      expect(mockQuery.skip).toHaveBeenCalledWith(
        (queryEventsDto.page - 1) * queryEventsDto.limit,
      );
      expect(mockQuery.limit).toHaveBeenCalledWith(queryEventsDto.limit);
      expect(mockQuery.sort).toHaveBeenCalledWith({
        [queryEventsDto.sortBy]: queryEventsDto.sort === 'desc' ? -1 : 1,
      });
      expect(result).toEqual({
        events: [mockEvent],
        metadata: expect.anything(),
      });
    });
  });
});
