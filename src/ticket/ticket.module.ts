import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QrcodeModule } from '../qrcode/qrcode.module';
import { TicketController } from './ticket.controller';
import { Ticket, TicketSchema } from './ticket.entity';
import { TicketService } from './ticket.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
    QrcodeModule,
  ],
  providers: [TicketService],
  controllers: [TicketController],
  exports: [TicketService],
})
export class TicketModule {}
