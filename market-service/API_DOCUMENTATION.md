# Market Service API Documentation

## Authentication

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
- **Headers**: `Authorization: Bearer <token>`
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
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "type": "string",
    "location": "string",
    "latitude": "number",
    "longitude": "number",
    "ownerId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Get Markets

- **URL**: `/markets`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "location": "string",
      "latitude": "number",
      "longitude": "number",
      "ownerId": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

### Get Market by ID

- **URL**: `/markets/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "type": "string",
    "location": "string",
    "latitude": "number",
    "longitude": "number",
    "ownerId": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "lots": [ ... ]
  }
  ```

### Update Market

- **URL**: `/markets/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
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
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "type": "string",
    "location": "string",
    "latitude": "number",
    "longitude": "number",
    "ownerId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Delete Market

- **URL**: `/markets/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "type": "string",
    "location": "string",
    "latitude": "number",
    "longitude": "number",
    "ownerId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Find Nearest Market

- **URL**: `/markets/nearest-market`
- **Method**: `GET`
- **Query Params**: `lat=<latitude>&lon=<longitude>`
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "type": "string",
    "location": "string",
    "latitude": "number",
    "longitude": "number",
    "ownerId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

## Lots

### Create Lot

- **URL**: `/lots`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "string",
    "details": "string",
    "price": "number",
    "shape": { ... },
    "position": { ... },
    "marketId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "details": "string",
    "price": "number",
    "shape": { ... },
    "position": { ... },
    "marketId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Get Lots

- **URL**: `/lots`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `marketId=<marketId>`
- **Response**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "details": "string",
      "price": "number",
      "shape": { ... },
      "position": { ... },
      "marketId": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

### Get Lot by ID

- **URL**: `/lots/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "details": "string",
    "price": "number",
    "shape": { ... },
    "position": { ... },
    "marketId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Update Lot

- **URL**: `/lots/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "string",
    "details": "string",
    "price": "number",
    "shape": { ... },
    "position": { ... }
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "details": "string",
    "price": "number",
    "shape": { ... },
    "position": { ... },
    "marketId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Delete Lot

- **URL**: `/lots/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "details": "string",
    "price": "number",
    "shape": { ... },
    "position": { ... },
    "marketId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Check Lot Availability

- **URL**: `/lots/:id/availability`
- **Method**: `GET`
- **Query Params**: `date=<date>`
- **Response**:
  ```json
  {
    "available": true | false
  }
  ```

### Book Lot

- **URL**: `/lots/:id/book`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "date": "string"
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "tenantId": "string",
    "lotId": "string",
    "status": "PENDING",
    "date": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

## Bookings

### Request Booking

- **URL**: `/bookings`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "lotId": "string",
    "date": "string"
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "tenantId": "string",
    "lotId": "string",
    "status": "PENDING",
    "date": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Get Landlord Bookings

- **URL**: `/bookings/landlord`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  [
    {
      "id": "string",
      "tenantId": "string",
      "lotId": "string",
      "status": "PENDING | APPROVED | REJECTED | CANCELLED",
      "date": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "lot": { ... }
    }
  ]
  ```

### Get Tenant Bookings

- **URL**: `/bookings/tenant`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  [
    {
      "id": "string",
      "tenantId": "string",
      "lotId": "string",
      "status": "PENDING | APPROVED | REJECTED | CANCELLED",
      "date": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "lot": { ... }
    }
  ]
  ```

### Update Booking Status

- **URL**: `/bookings/:id/status`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "status": "APPROVED | REJECTED"
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "tenantId": "string",
    "lotId": "string",
    "status": "APPROVED | REJECTED",
    "date": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Cancel Booking

- **URL**: `/bookings/:id/cancel`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "id": "string",
    "tenantId": "string",
    "lotId": "string",
    "status": "CANCELLED",
    "date": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```
