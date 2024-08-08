import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { GetUser, Roles } from 'src/auth/decorator';
import { JwtAuthGuard, RolesGuard } from 'src/auth/guard';
import { Role } from 'src/auth/guard/roles';
import { SystemMessages } from 'src/common/constants/system-messages';
import { TicketService } from './ticket.service';

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get('event/:eventId')
  @Roles(Role.Eventee)
  async getTicketByEventandUser(
    @GetUser('id') userId: Types.ObjectId,
    @Param('eventId') eventId: Types.ObjectId,
  ) {
    const ticket = await this.ticketService.getTicketByEventAndUser(
      eventId,
      userId,
    );
    return { message: SystemMessages.TICKET_RETRIEVE_SUCCESS, ticket };
  }

  @Get('events/:eventId')
  @Roles(Role.Creator)
  async getEventTickets(@Param('eventId') eventId: Types.ObjectId) {
    const tickets = await this.ticketService.getEventTickets(eventId);
    return { message: SystemMessages.TICKET_RETRIEVE_SUCCESS, tickets };
  }

  @Patch('events/:eventId/scan')
  @Roles(Role.Creator)
  async verifyTicket(
    @Param('eventId') eventId: Types.ObjectId,
    @Body() userId: Types.ObjectId,
  ) {
    await this.ticketService.verifyTicketQRCode(eventId, userId);
    return { message: SystemMessages.TICKET_SCAN_SUCCESS };
  }
}
