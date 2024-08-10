import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisService } from '../common/redis/redis.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { QrcodeModule } from '../qrcode/qrcode.module';
import { TicketModule } from '../ticket/ticket.module';
import { UserModule } from '../users/user.module';
import { EventsController } from './events.controller';
import { EventSchema } from './events.entity';
import { EventsService } from './events.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
    forwardRef(() => UserModule),
    // UserModule,
    NotificationsModule,
    TicketModule,
    QrcodeModule,
  ],
  controllers: [EventsController],
  providers: [RedisService, EventsService],
  exports: [EventsService],
})
export class EventsModule {}
