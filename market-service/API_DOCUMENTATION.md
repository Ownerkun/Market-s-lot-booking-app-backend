# Market Service API Documentation

## Endpoints

### 1. Create Market

- **URL:** `/api/markets`
- **Method:** `POST`
- **Description:** Creates a new market.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "string",
    "type": "string",
    "location": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "string",
    "name": "string",
    "type": "string",
    "location": "string",
    "ownerId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### 2. Get Markets

- **URL:** `/api/markets`
- **Method:** `GET`
- **Description:** Retrieves all markets for tenants or markets owned by the landlord.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "location": "string",
      "ownerId": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

### 3. Get Market By ID

- **URL:** `/api/markets/:id`
- **Method:** `GET`
- **Description:** Retrieves a market by its ID.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "id": "string",
    "name": "string",
    "type": "string",
    "location": "string",
    "ownerId": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "lots": [
      {
        "id": "string",
        "name": "string",
        "details": "string",
        "price": "number",
        "available": "boolean",
        "shape": "json",
        "position": "json",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ]
  }
  ```

### 4. Update Market

- **URL:** `/api/markets/:id`
- **Method:** `PUT`
- **Description:** Updates a market by its ID.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "string",
    "type": "string",
    "location": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "string",
    "name": "string",
    "type": "string",
    "location": "string",
    "ownerId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### 5. Delete Market

- **URL:** `/api/markets/:id`
- **Method:** `DELETE`
- **Description:** Deletes a market by its ID.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "message": "Market deleted successfully"
  }
  ```

### 6. Create Lot

- **URL:** `/api/markets/:marketId/lots`
- **Method:** `POST`
- **Description:** Creates a new lot in a market.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "string",
    "details": "string",
    "price": "number",
    "available": "boolean",
    "shape": "json",
    "position": "json"
  }
  ```
- **Response:**
  ```json
  {
    "id": "string",
    "name": "string",
    "details": "string",
    "price": "number",
    "available": "boolean",
    "shape": "json",
    "position": "json",
    "marketId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### 7. Get Lots

- **URL:** `/api/markets/:marketId/lots`
- **Method:** `GET`
- **Description:** Retrieves all lots in a market.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "details": "string",
      "price": "number",
      "available": "boolean",
      "shape": "json",
      "position": "json",
      "marketId": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

### 8. Get Lot By ID

- **URL:** `/api/markets/:marketId/lots/:id`
- **Method:** `GET`
- **Description:** Retrieves a lot by its ID.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "id": "string",
    "name": "string",
    "details": "string",
    "price": "number",
    "available": "boolean",
    "shape": "json",
    "position": "json",
    "marketId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### 9. Update Lot

- **URL:** `/api/markets/:marketId/lots/:id`
- **Method:** `PUT`
- **Description:** Updates a lot by its ID.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "string",
    "details": "string",
    "price": "number",
    "available": "boolean",
    "shape": "json",
    "position": "json"
  }
  ```
- **Response:**
  ```json
  {
    "id": "string",
    "name": "string",
    "details": "string",
    "price": "number",
    "available": "boolean",
    "shape": "json",
    "position": "json",
    "marketId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### 10. Delete Lot

- **URL:** `/api/markets/:marketId/lots/:id`
- **Method:** `DELETE`
- **Description:** Deletes a lot by its ID.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "message": "Lot deleted successfully"
  }
  ```

### 11. Request Booking

- **URL:** `/api/bookings`
- **Method:** `POST`
- **Description:** Requests a booking for a lot.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "lotId": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "string",
    "tenantId": "string",
    "lotId": "string",
    "status": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### 12. Get Landlord Bookings

- **URL:** `/api/bookings/landlord`
- **Method:** `GET`
- **Description:** Retrieves all bookings for the landlord.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  ```json
  [
    {
      "id": "string",
      "tenantId": "string",
      "lotId": "string",
      "status": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "lot": {
        "id": "string",
        "name": "string",
        "details": "string",
        "price": "number",
        "available": "boolean",
        "shape": "json",
        "position": "json",
        "marketId": "string",
        "createdAt": "string",
        "updatedAt": "string"
      }
    }
  ]
  ```

### 13. Update Booking Status

- **URL:** `/api/bookings/:id/status`
- **Method:** `PUT`
- **Description:** Updates the status of a booking.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "status": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "string",
    "tenantId": "string",
    "lotId": "string",
    "status": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

## Error Responses

- **400 Bad Request:** Invalid input data.
- **401 Unauthorized:** Authentication failed or token expired.
- **403 Forbidden:** Access denied.
- **404 Not Found:** Resource not found.
- **500 Internal Server Error:** Server encountered an error.
