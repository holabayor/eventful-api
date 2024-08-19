import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { CombinedLogger } from '../common/logger/combined.logger';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './notifications.entity';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private readonly logger: CombinedLogger,
    private config: ConfigService,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: this.config.get('MAIL_USER'),
        pass: this.config.get('MAIL_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: this.config.get('MAIL_FROM'),
      to,
      subject,
      html,
    };
    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      throw new Error('Error sending email');
    }
  }

  async scheduleNotification(notification: Notification): Promise<void> {
    const jobName = `notification-${notification.id}`;
    const date = new Date(notification.reminderDate);

    const job = new CronJob(date, async () => {
      const subject = `Reminder for ${notification.eventTitle}`;
      const html = `Dear user.\n\nThis is a reminder for the event: ${notification.eventTitle}.\n\nBest Regards,\nEventul Team`;

      await this.sendMail(notification.email, subject, html);

      await this.notificationModel.findByIdAndUpdate(notification.id, {
        status: 'sent',
      });
      this.logger.log(
        `Reminder email sent to ${notification.email} for event ${notification.eventTitle}`,
      );
    });

    this.schedulerRegistry.addCronJob(jobName, job);

    job.start();
  }

  async sendTicketNotification(
    email: string,
    eventTitle: string,
    qrCode: string,
  ): Promise<void> {
    const subject = `Your Ticket for ${eventTitle}`;
    const html = `<p>Dear Attendee,</p>
                  <p>You have successfully registered for ${eventTitle}.</p>
                  <p> Here is your ticket:</p>
                  <p><img src=${qrCode} alt="QR Code" /></p>
                  <p>Please present this QR code at the event for entry.</p>`;

    this.sendMail(email, subject, html);
  }

  async createNotification(
    notificationData: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = await this.notificationModel.create(notificationData);

    await this.scheduleNotification(notification);

    return notification;
  }

  async getNotifications(): Promise<Notification[]> {
    return await this.notificationModel.find().exec();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkPendingNotifications() {
    const pendingNotifications = await this.notificationModel
      .find({ status: 'scheduled' })
      .exec();

    pendingNotifications.forEach(async (notification) => {
      this.scheduleNotification(notification);
    });
  }
}
