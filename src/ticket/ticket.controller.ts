import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
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

  @Get('/:ticketId')
  async findTicketById(@Param('ticketId') ticketId: Types.ObjectId) {
    const ticket = await this.ticketService.findTicketById(ticketId);
    return { message: SystemMessages.TICKET_RETRIEVE_SUCCESS, ticket };
  }

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

  @Post('/:ticketId/scan')
  @Roles(Role.Creator)
  async scanTicket(
    @GetUser('id') userId: Types.ObjectId,
    @Param('ticketId') ticketId: Types.ObjectId,
  ) {
    await this.ticketService.scanTicket(userId, ticketId);
    return { message: SystemMessages.TICKET_SCAN_SUCCESS };
  }

  @Patch('/:ticketId/cancel')
  @Roles(Role.Creator)
  async cancelTicket(
    @GetUser('id') userId: Types.ObjectId,
    @Param('ticketId') ticketId: Types.ObjectId,
  ) {
    await this.ticketService.cancelTicket(userId, ticketId);
    return { message: SystemMessages.TICKET_CANCEL_SUCCESS };
  }
}
