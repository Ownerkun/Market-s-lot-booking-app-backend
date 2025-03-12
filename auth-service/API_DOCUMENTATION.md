# Auth Service API Documentation

## Endpoints

### 1. User Registration

- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Description:** Registers a new user.
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string",
    "role": "string"
  }
  ```
- **Response:**
  ```json
  {
    "statusCode": 201,
    "message": "User registered successfully",
    "data": {
      "userId": "string",
      "profile": {
        "firstName": "string",
        "lastName": "string",
        "birthDate": "string"
      }
    }
  }
  ```

### 2. User Login

- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Description:** Authenticates a user and returns a token.
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "statusCode": 200,
    "message": "Login successful",
    "data": {
      "token": "string"
    }
  }
  ```

### 3. Validate Token

- **URL:** `/api/auth/validate-token`
- **Method:** `POST`
- **Description:** Validates a JWT token.
- **Request Body:**
  ```json
  {
    "token": "string"
  }
  ```
- **Response:**
  ```json
  {
    "valid": true,
    "user": {
      "userId": "string",
      "role": "string"
    }
  }
  ```

### 4. Validate User

- **URL:** `/api/auth/validate-user/:userId`
- **Method:** `GET`
- **Description:** Validates if a user exists.
- **Response:**
  ```json
  {
    "valid": true,
    "user": {
      "id": "string",
      "email": "string",
      "role": "string",
      "profile": {
        "firstName": "string",
        "lastName": "string",
        "birthDate": "string"
      }
    }
  }
  ```

### 5. Get User Profile

- **URL:** `/api/auth/profile/:userId`
- **Method:** `GET`
- **Description:** Retrieves the profile of the authenticated user.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "statusCode": 200,
    "data": {
      "userId": "string",
      "email": "string",
      "role": "string",
      "profile": {
        "firstName": "string",
        "lastName": "string",
        "birthDate": "string",
        "profilePicture": "string"
      }
    }
  }
  ```

### 6. Update User Profile

- **URL:** `/api/auth/profile/:userId`
- **Method:** `PUT`
- **Description:** Updates the profile of the authenticated user.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "birthDate": "string",
    "profilePicture": "string"
  }
  ```
- **Response:**
  ```json
  {
    "statusCode": 200,
    "message": "Profile updated successfully",
    "data": {
      "firstName": "string",
      "lastName": "string",
      "birthDate": "string",
      "profilePicture": "string"
    }
  }
  ```

## Error Responses

- **400 Bad Request:** Invalid input data.
- **401 Unauthorized:** Authentication failed or token expired.
- **403 Forbidden:** Access denied.
- **404 Not Found:** Resource not found.
- **500 Internal Server Error:** Server encountered an error.
