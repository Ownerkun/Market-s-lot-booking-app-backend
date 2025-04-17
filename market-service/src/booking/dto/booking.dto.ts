export class CreateBookingDto {
  lotId: string;
  startDate: Date;
  endDate: Date;
  isOneDay?: boolean;
}

export class UpdateBookingStatusDto {
  status: 'APPROVED' | 'REJECTED';
  reason?: string;
}

export class ArchiveBookingDto {
  isArchived: boolean;
}
