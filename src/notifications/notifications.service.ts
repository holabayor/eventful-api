import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as scheduler from 'node-schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './notifications.entity';
// import Handlebars from 'handlebars';

@Injectable()
export class NotificationsService {
  private transporter;

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private config: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      // host: this.config.get('MAIL_HOST'),
      // port: this.config.get('MAIL_PORT'),
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
      return this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error('Error sending email');
    }
  }

  async scheduleNotification(notification: Notification): Promise<void> {
    scheduler.scheduleJob(notification.reminderDate, async () => {
      const subject = `Reminder for ${notification.eventTitle}`;
      const html = `Dear user.\n\nThis is a reminder for the event: ${notification.eventTitle}.\n\nBest Regards,\nEventul Team`;
      this.sendMail(notification.email, subject, html);

      await this.notificationModel.findByIdAndUpdate(notification.id, {
        status: 'sent',
      });
    });
  }

  async sendTicketNotification(
    email: string,
    eventTitle: string,
    qrCode: string,
  ): Promise<void> {
    console.log('The qrcode is ', qrCode);
    const base64Data = qrCode.split(',')[1];
    const subject = `Your Ticket for ${eventTitle}`;
    // const template = Handlebars.compile();
    const html = `<p>Dear Attendee,</p>
<p>You have successfully registered for ${eventTitle}.</p>
<p> Here is your ticket:</p>
<p><img src="${qrCode}" alt="QR Code" /></p>
<p>Please present this QR code at the event for entry.</p>`;
    this.sendMail(email, subject, html);
  }

  async createNotification(
    notificationData: Partial<Notification>,
  ): Promise<Notification> {
    const notification = new this.notificationModel(notificationData);

    await notification.save();

    await this.scheduleNotification(notification);

    return notification;
  }

  async getNotifications(): Promise<Notification[]> {
    return await this.notificationModel.find().exec();
  }
}
