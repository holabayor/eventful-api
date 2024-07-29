import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from './events.entity';
import { UserModule } from 'src/users/user.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { TicketModule } from 'src/ticket/ticket.module';
import { QrcodeModule } from 'src/qrcode/qrcode.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
    UserModule,
    NotificationsModule,
    TicketModule,
    QrcodeModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
