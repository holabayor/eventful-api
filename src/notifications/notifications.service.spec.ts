import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { CombinedLogger } from '../common/logger/combined.logger';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './notifications.entity';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationModel: Model<Notification>;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getModelToken(Notification.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
        {
          provide: CombinedLogger,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            setContext: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: SchedulerRegistry,
          useValue: {
            addCronJob: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationModel = module.get<Model<Notification>>(
      getModelToken(Notification.name),
    );
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('sendMail', () => {
    it('should send an email successfully', async () => {
      // Mock the transporter.sendMail method
      const sendMailMock = jest.fn().mockResolvedValueOnce(undefined);
      jest
        .spyOn(service['transporter'], 'sendMail')
        .mockImplementation(sendMailMock);

      const to = 'test@example.com';
      const subject = 'Test Subject';
      const html = '<p>Test HTML</p>';

      await service.sendMail(to, subject, html);

      expect(sendMailMock).toHaveBeenCalledWith({
        from: configService.get('MAIL_FROM'),
        to,
        subject,
        html,
      });
      expect(service['logger'].log).toHaveBeenCalledWith(`Email sent to ${to}`);
    });

    it('should throw an error if sending email fails', async () => {
      // Mock the transporter.sendMail method to throw an error
      const sendMailMock = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed to send email'));
      jest
        .spyOn(service['transporter'], 'sendMail')
        .mockImplementation(sendMailMock);

      const to = 'test@example.com';
      const subject = 'Test Subject';
      const html = '<p>Test HTML</p>';

      await expect(service.sendMail(to, subject, html)).rejects.toThrow(
        'Error sending email',
      );
      expect(service['logger'].error).toHaveBeenCalledWith(
        `Failed to send email to ${to}`,
        expect.any(String),
      );
    });
  });

  describe('sendTicketNotification', () => {
    it('should send a ticket notification email', async () => {
      // Mock the sendMail method
      const sendMailMock = jest.fn().mockResolvedValueOnce(undefined);
      jest.spyOn(service, 'sendMail').mockImplementation(sendMailMock);

      const email = 'test@example.com';
      const eventTitle = 'Test Event';
      const qrCode = 'https://example.com/qr-code.png';

      await service.sendTicketNotification(email, eventTitle, qrCode);

      expect(sendMailMock).toHaveBeenCalled();
    });
  });

  describe('createNotification', () => {
    it('should create a notification and schedule it', async () => {
      const notificationData: CreateNotificationDto = {
        eventTitle: 'Test Event',
        reminderDate: '2024-20-01',
        userId: new Types.ObjectId(),
        email: 'user@mail.com',
        eventId: new Types.ObjectId(),
      };

      // const createdNotification =
      //   await notificationModel.create(notificationData);

      const createdNotification = {
        _id: new Types.ObjectId(),
        ...notificationData,
      } as Notification;

      // Mock the create method
      jest
        .spyOn(notificationModel, 'create')
        .mockResolvedValueOnce(createdNotification as any);

      // Mock the scheduleNotification method
      jest
        .spyOn(service, 'scheduleNotification')
        .mockResolvedValueOnce(undefined);

      const result = await service.createNotification(notificationData);

      expect(notificationModel.create).toHaveBeenCalledWith(notificationData);
      expect(service.scheduleNotification).toHaveBeenCalledWith(
        createdNotification,
      );
      expect(result).toEqual(createdNotification);
    });
  });

  describe('getNotifications', () => {
    it('should return all notifications', async () => {
      const notifications: Partial<Notification>[] = [
        {
          _id: 'notification-1',
          eventTitle: 'Event 1',
          reminderDate: '2024-10-11',
        },
        {
          _id: 'notification-2',
          eventTitle: 'Event 2',
          reminderDate: '2024-12-11',
        },
      ];

      // Mock the find method
      jest.spyOn(notificationModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(notifications),
      } as any);

      const result = await service.getNotifications();

      expect(notificationModel.find).toHaveBeenCalled();
      expect(result).toEqual(notifications);
    });
  });

  describe('checkPendingNotifications', () => {
    it('should schedule pending notifications', async () => {
      const pendingNotifications: Partial<Notification>[] = [
        {
          _id: 'notification-1',
          eventTitle: 'Event 1',
          reminderDate: '2024-10-01',
          status: 'scheduled',
        },
        {
          _id: 'notification-2',
          eventTitle: 'Event 2',
          reminderDate: '2024-12-01',
          status: 'scheduled',
        },
      ];

      // Mock the find method
      jest.spyOn(notificationModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(pendingNotifications),
      } as any);

      // Mock the scheduleNotification method
      jest
        .spyOn(service, 'scheduleNotification')
        .mockResolvedValueOnce(undefined);

      await service.checkPendingNotifications();

      expect(notificationModel.find).toHaveBeenCalledWith({
        status: 'scheduled',
      });
      expect(service.scheduleNotification).toHaveBeenCalledTimes(
        pendingNotifications.length,
      );
    });
  });
});
