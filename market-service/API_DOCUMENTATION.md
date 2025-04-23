# Market Service API Documentation

## Authentication

All endpoints require JWT authentication using Bearer token in Authorization header.

### Request Header

```json
{
  "Authorization": "Bearer <jwt_token>"
}
```

### Register

- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "role": "TENANT | LANDLORD"
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 201,
    "message": "User registered successfully",
    "data": {
      "userId": "string",
      "profile": { ... }
    }
  }
  ```

### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 200,
    "message": "Login successful",
    "data": {
      "token": "string"
    }
  }
  ```

## Markets

### Create Market

- **URL**: `/markets`
- **Method**: `POST`
- **Auth**: Required (LANDLORD only)
- **Body**:

```json
{
  "name": "string",
  "type": "string",
  "location": "string",
  "latitude": "number",
  "longitude": "number"
}
```

- **Response**: Market object
- **Error Responses**:
  ```json
  {
    "statusCode": 403,
    "message": "Invalid ownerId"
  }
  ```

### Get Markets

- **URL**: `/markets`
- **Method**: `GET`
- **Auth**: Required
- **Notes**:
  - TENANT can see all markets
  - LANDLORD can only see owned markets
- **Response**: Array of Market objects with tags
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "location": "string",
      "latitude": "number",
      "longitude": "number",
      "ownerId": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "tags": [
        {
          "id": "string",
          "name": "string",
          "isSystem": "boolean"
        }
      ]
    }
  ]
  ```

### Get Market by ID

- **URL**: `/markets/:id`
- **Method**: `GET`
- **Auth**: Required
- **Notes**:
  - TENANT can see any market
  - LANDLORD can only see owned markets
- **Response**: Market object with lots and tags
  ```json
  {
    "id": "string",
    "name": "string",
    "location": "string",
    "latitude": "number",
    "longitude": "number",
    "ownerId": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "tags": [
      {
        "id": "string",
        "name": "string",
        "isSystem": "boolean"
      }
    ],
    "lots": [
      {
        "id": "string",
        "name": "string",
        "details": "string",
        "price": "number",
        "available": "boolean",
        "shape": "object",
        "position": "object"
      }
    ]
  }
  ```
- **Error Responses**:
  ```json
  {
    "statusCode": 404,
    "message": "Market not found"
  }
  ```
  ```json
  {
    "statusCode": 403,
    "message": "You do not have permission to access this market"
  }
  ```

### Update Market

- **URL**: `/markets/:id`
- **Method**: `PUT`
- **Auth**: Required (Market owner only)
- **Body**:
  ```json
  {
    "name": "string",
    "location": "string",
    "latitude": "number",
    "longitude": "number",
    "ownerId": "string",
    "tagIds": ["string"] // Optional array of tag IDs
  }
  ```
- **Response**: Updated Market object with tags
- **Error Responses**:
  ```json
  {
    "statusCode": 404,
    "message": "Market not found"
  }
  ```
  ```json
  {
    "statusCode": 403,
    "message": "You do not have permission to update this market"
  }
  ```

### Delete Market

- **URL**: `/markets/:id`
- **Method**: `DELETE`
- **Auth**: Required (Market owner only)
- **Response**: Deleted Market object
- **Error Responses**:
  ```json
  {
    "statusCode": 404,
    "message": "Market not found"
  }
  ```
  ```json
  {
    "statusCode": 403,
    "message": "You do not have permission to delete this market"
  }
  ```

### Find Nearest Market

- **URL**: `/markets/nearest-market`
- **Method**: `GET`
- **Query Params**:
  - `lat`: number (latitude)
  - `lon`: number (longitude)
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "type": "string",
    "location": "string",
    "latitude": "number",
    "longitude": "number",
    "ownerId": "string"
  }
  ```
- **Error Response**:
  ```json
  {
    "statusCode": 404,
    "message": "No markets found near the specified location"
  }
  ```

## Market Tags

### Create Tag

- **URL**: `/market-tags`
- **Method**: `POST`
- **Auth**: Required
- **Body**:
  ```json
  {
    "name": "string"
  }
  ```
- **Response**: Created MarketTag object

### Get Tags

- **URL**: `/market-tags`
- **Method**: `GET`
- **Auth**: Required
- **Response**: Array of MarketTag objects

### Update Tag

- **URL**: `/market-tags/:id`
- **Method**: `PUT`
- **Auth**: Required
- **Body**:
  ```json
  {
    "name": "string"
  }
  ```
- **Response**: Updated MarketTag object

### Delete Tag

- **URL**: `/market-tags/:id`
- **Method**: `DELETE`
- **Auth**: Required
- **Response**: Deleted MarketTag object
- **Error Response**:
  ```json
  {
    "statusCode": 403,
    "message": "Cannot delete system tags"
  }
  ```

### Assign Tags to Market

- **URL**: `/market-tags/:marketId/assign-tags`
- **Method**: `POST`
- **Auth**: Required
- **Body**:
  ```json
  {
    "tagIds": "string[]"
  }
  ```
- **Response**: Updated Market object with tags

## Lots

### Create Lot

- **URL**: `/lots`
- **Method**: `POST`
- **Auth**: Required (Market owner only)
- **Body**:

```json
{
  "name": "string",
  "details": "string",
  "price": "number",
  "shape": "object",
  "position": "object",
  "marketId": "string"
}
```

- **Response**: Created Lot object

### Get Lots

- **URL**: `/lots`
- **Method**: `GET`
- **Auth**: Required
- **Query Params**: `marketId`
- **Response**: Array of Lot objects

### Get Lot by ID

- **URL**: `/lots/:id`
- **Method**: `GET`
- **Auth**: Required
- **Response**: Lot object

### Update Lot

- **URL**: `/lots/:id`
- **Method**: `PUT`
- **Auth**: Required (Market owner only)
- **Body**:

```json
{
  "name": "string",
  "details": "string",
  "price": "number",
  "available": "boolean",
  "shape": "object",
  "position": "object"
}
```

- **Response**: Updated Lot object

### Delete Lot

- **URL**: `/lots/:id`
- **Method**: `DELETE`
- **Auth**: Required (Market owner only)
- **Response**: Deleted Lot object

### Check Lot Availability

- **URL**: `/lots/:id/availability`
- **Method**: `GET`
- **Query Params**: `date` (YYYY-MM-DD)
- **Response**:
  ```json
  {
    "available": "boolean",
    "reason": "string" // Only present when not available due to pending booking
  }
  ```

### Book Lot

- **URL**: `/lots/:id/book`
- **Method**: `POST`
- **Auth**: Required (TENANT only)
- **Body**:

```json
{
  "date": "string" // YYYY-MM-DD
}
```

- **Response**: Created Booking object

### Check Lot Monthly Availability

- **URL**: `/bookings/lots/:lotId/availability-month`
- **Method**: `GET`
- **Query Params**:
  - `month`: number (1-12)
  - `year`: number
- **Response**:
  ```json
  {
    "available": "boolean",
    "bookedDates": "Date[]",
    "pendingDates": "Date[]"
  }
  ```

### Get Pending Dates

- **URL**: `/bookings/lots/:lotId/pending-dates`
- **Method**: `GET`
- **Query Params**:
  - `month`: number (1-12)
  - `year`: number
- **Response**:
  ```json
  {
    "pendingDates": "Date[]"
  }
  ```

## Bookings

### Request Booking

- **URL**: `/bookings`
- **Method**: `POST`
- **Auth**: Required (TENANT only)
- **Body**:
  ```json
  {
    "lotId": "string",
    "startDate": "string", // YYYY-MM-DD
    "endDate": "string", // YYYY-MM-DD
    "isOneDay": "boolean" // Optional, for single-day bookings
  }
  ```
- **Response**: Created Booking object

### Get Landlord Bookings

- **URL**: `/bookings/landlord`
- **Method**: `GET`
- **Auth**: Required (LANDLORD only)
- **Response**: Array of Booking objects with lot and market details

### Get Tenant Bookings

- **URL**: `/bookings/tenant`
- **Method**: `GET`
- **Auth**: Required (TENANT only)
- **Response**: Array of Booking objects with lot details

### Update Booking Status

- **URL**: `/bookings/:id/status`
- **Method**: `PUT`
- **Auth**: Required (LANDLORD only)
- **Body**:
  ```json
  {
    "status": "APPROVED | REJECTED",
    "reason": "string" // Optional, required when rejecting
  }
  ```
- **Response**: Updated Booking object

### Cancel Booking

- **URL**: `/bookings/:id/cancel`
- **Method**: `PUT`
- **Auth**: Required (Market owner only)
- **Response**: Updated Booking object with status "CANCELLED"
- **Error Responses**:
  ```json
  {
    "statusCode": 403,
    "message": "Only the market owner can cancel bookings"
  }
  ```
  ```json
  {
    "statusCode": 400,
    "message": "Only approved bookings can be cancelled"
  }
  ```

### Check Lot Availability

- **URL**: `/bookings/:lotId/availability`
- **Method**: `GET`
- **Query Params**:
  - `startDate`: string (YYYY-MM-DD)
  - `endDate`: string (YYYY-MM-DD)
- **Response**:
  ```json
  {
    "available": "boolean",
    "reason": "string" // Only present when not available due to pending booking
  }
  ```

## Payments

### Submit Payment

- **URL**: `/bookings/:id/payment`
- **Method**: `POST`
- **Auth**: Required (TENANT only)
- **Content-Type**: `multipart/form-data`
- **Body**:
  ```json
  {
    "paymentMethod": "string",
    "paymentProof": "file"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Payment submitted successfully",
    "booking": {
      "id": "string",
      "paymentStatus": "PAID",
      "paymentMethod": "string",
      "paymentProof": "string"
      // ... other booking fields
    }
  }
  ```

### Verify Payment

- **URL**: `/bookings/:id/verify-payment`
- **Method**: `PUT`
- **Auth**: Required (LANDLORD only)
- **Body**:
  ```json
  {
    "isVerified": "boolean",
    "reason": "string" // Optional, required when rejecting
  }
  ```
- **Response**: Updated Booking object
- **Notes**:
  - When payment is verified, booking status is automatically set to APPROVED
  - When payment is rejected, payment status is set to REJECTED

### Get Payment Due Bookings

- **URL**: `/bookings/payment-due`
- **Method**: `GET`
- **Auth**: Required (TENANT only)
- **Response**: Array of Booking objects with pending payments past due date
