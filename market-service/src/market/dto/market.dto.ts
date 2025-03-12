// market.dto.ts
export class CreateMarketDto {
    name: string;
    type: string;
    location: string;
    ownerId: string;
  }
  
  export class UpdateMarketDto {
    name?: string;
    type?: string;
    location?: string;
    ownerId?: string;
  }
  
  // lot.dto.ts
  export class CreateLotDto {
    name: string;
    details: string;
    price: number;
    available: boolean;
    shape: any; // JSON object for polygon coordinates
    position: any; // JSON object for position (x, y)
  }
  
  export class UpdateLotDto {
    name?: string;
    details?: string;
    price?: number;
    available?: boolean;
    shape?: any; // JSON object for polygon coordinates
    position?: any; // JSON object for position (x, y)
  }