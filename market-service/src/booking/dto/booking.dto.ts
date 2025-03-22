export class CreateBookingDto {
    lotId: string;
    date: Date;
  }
  
  export class UpdateBookingStatusDto {
    status: 'APPROVED' | 'REJECTED';
  }
  