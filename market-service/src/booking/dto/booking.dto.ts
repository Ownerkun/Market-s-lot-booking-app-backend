import { Type } from "class-transformer";
import { IsDate } from "class-validator";

export class CreateBookingDto {
  lotId: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
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
