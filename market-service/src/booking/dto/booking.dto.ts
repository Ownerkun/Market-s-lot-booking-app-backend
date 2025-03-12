export class CreateBookingDto {
    lotId: string;
  }
  
  export class UpdateBookingStatusDto {
    status: 'APPROVED' | 'REJECTED';
  }
  