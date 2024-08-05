import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser, Roles } from 'src/auth/decorator';
import { JwtAuthGuard, RolesGuard } from 'src/auth/guard';
import { Role } from 'src/auth/guard/roles';
import { TicketService } from './ticket.service';

@ApiTags('Tickets')
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
    @GetUser('id') userId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.ticketService.getTicketByEventAndUser(eventId, userId);
  }

  @Get('events/:eventId')
  @Roles(Role.Creator)
  getEventTickets(
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
