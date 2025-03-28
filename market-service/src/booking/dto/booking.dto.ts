export class CreateBookingDto {
  lotId: string;
  startDate: Date;
  endDate: Date;
}
  
  export class UpdateBookingStatusDto {
    status: 'APPROVED' | 'REJECTED';
    reason?: string;
  }
  