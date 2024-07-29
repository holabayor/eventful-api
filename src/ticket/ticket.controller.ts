import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard, RolesGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator';
import { Role } from 'src/auth/guard/roles';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @Roles(Role.Creator)
  createTicket() {
    // return this.ticketService.create(eventId: stringify, user);
  }

  @Get('event/:eventId')
  @Roles(Role.Eventee)
  getTicketByEventandUser(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
  ) {
    return this.ticketService.getTicketByEventAndUser(eventId, userId);
  }

  @Get('event/:eventId/verify')
  @Roles(Role.Creator)
  verifyTicket(@Param('eventId') eventId: string, @Body() qrCode: string) {
    return this.ticketService.verifyTicketQRCode(eventId, qrCode);
  }
}
