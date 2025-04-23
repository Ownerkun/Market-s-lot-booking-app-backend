// payment.dto.ts
export class SubmitPaymentDto {
    bookingId: string;
    paymentMethod: string;
  }
  
  export class VerifyPaymentDto {
    bookingId: string;
    isVerified: boolean;
    reason?: string;
  }