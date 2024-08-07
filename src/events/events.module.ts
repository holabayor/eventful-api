import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisService } from 'src/common/redis/redis.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { QrcodeModule } from 'src/qrcode/qrcode.module';
import { TicketModule } from 'src/ticket/ticket.module';
import { UserModule } from 'src/users/user.module';
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
