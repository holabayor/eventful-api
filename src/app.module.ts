import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './users/user.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TicketModule } from './ticket/ticket.module';
import { QrcodeModule } from './qrcode/qrcode.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    UserModule,
    AuthModule,
    EventsModule,
    QrcodeModule,
    NotificationsModule,
    TicketModule,
  ],
})
export class AppModule {}
