import { Event } from '../../events/events.entity';

interface Metadata {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface FindAllResult {
  events: Event[];
  metadata?: Metadata;
}
