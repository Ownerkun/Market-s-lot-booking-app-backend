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
- **Response**: Array of Market objects

### Get Market by ID

- **URL**: `/markets/:id`
- **Method**: `GET`
- **Auth**: Required
- **Response**: Market object with lots

### Update Market

- **URL**: `/markets/:id`
- **Method**: `PUT`
- **Auth**: Required (Market owner only)
- **Body**: Same as Create Market
- **Response**: Updated Market object

### Delete Market

- **URL**: `/markets/:id`
- **Method**: `DELETE`
- **Auth**: Required (Market owner only)
- **Response**: Deleted Market object

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

## Bookings

### Request Booking

- **URL**: `/bookings`
- **Method**: `POST`
- **Auth**: Required (TENANT only)
- **Body**:

```json
{
  "lotId": "string",
  "date": "string" // YYYY-MM-DD
}
```

- **Response**: Created Booking object

### Get Landlord Bookings

- **URL**: `/bookings/landlord`
- **Method**: `GET`
- **Auth**: Required (LANDLORD only)
- **Response**: Array of Booking objects with lot details

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
    "status": "APPROVED" | "REJECTED"
  }
  ```
- **Response**: Updated Booking object
- **Error Responses**:
  ```json
  {
    "statusCode": 403,
    "message": "Only landlords can update booking status"
  }
  ```
  ```json
  {
    "statusCode": 403,
    "message": "You do not have permission to update this booking"
  }
  ```

### Cancel Booking

- **URL**: `/bookings/:id/cancel`
- **Method**: `PUT`
- **Auth**: Required (Booking tenant or landlord only)
- **Response**: Updated Booking object with status "CANCELLED"
- **Error Responses**:
  ```json
  {
    "statusCode": 403,
    "message": "You do not have permission to cancel this booking"
  }
  ```

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
