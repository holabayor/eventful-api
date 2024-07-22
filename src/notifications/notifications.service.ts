import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as scheduler from 'node-schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './notifications.entity';

@Injectable()
export class NotificationsService {
  private transporter;

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private config: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('MAIL_HOST'),
      port: this.config.get('MAIL_PORT'),
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

  async sendEmail(to: string, subject: string, text: string) {
    const mailOptions = {
      from: this.config.get('MAIL_FROM'),
      to,
      subject,
      text,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async scheduleNotification(notification: Notification): Promise<void> {
    scheduler.scheduleJob(notification.reminderDate, async () => {
      const subject = `Reminder for ${notification.eventTitle}`;
      const text = `Dear user.\n\nThis is a reminder for the event: ${notification.eventTitle}.\n\nBest Regards,\nEventul Team`;

      this.sendEmail(notification.email, subject, text);

      await this.notificationModel.findByIdAndUpdate(notification.id, {
        status: 'sent',
      });
    });
  }

  async createNotification(
    notificationData: Partial<Notification>,
  ): Promise<Notification> {
    const notification = new this.notificationModel(notificationData);

    await notification.save();

    await this.scheduleNotification(notification);

    return notification;
  }

  async getNotification(): Promise<Notification[]> {
    return await this.notificationModel.find().exec();
  }
}
