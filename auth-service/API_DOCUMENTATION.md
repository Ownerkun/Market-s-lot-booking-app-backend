# Auth Service API Documentation

## Authentication

All protected endpoints require JWT authentication using Bearer token in Authorization header.

### Request Header Example

```json
{
  "Authorization": "Bearer <jwt_token>"
}
```

## Endpoints

### Register User

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth**: Not required (Required with ADMIN role when registering new admin)
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "role": "TENANT | LANDLORD | ADMIN",
    "firstName": "string",
    "lastName": "string",
    "birthDate": "string (YYYY-MM-DD)" // optional
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 201,
    "message": "User registered successfully",
    "data": {
      "userId": "string",
      "profile": {
        "firstName": "string",
        "lastName": "string",
        "birthDate": "string",
        "createdAt": "string"
      }
    }
  }
  ```

### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth**: Not required
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

### Change Password

- **URL**: `/auth/change-password`
- **Method**: `POST`
- **Auth**: Required
- **Body**:
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 200,
    "message": "Password changed successfully"
  }
  ```

### Validate Token

- **URL**: `/auth/validate-token`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "token": "string"
  }
  ```
- **Response**:
  ```json
  {
    "valid": true,
    "user": {
      "userId": "string",
      "role": "string"
    }
  }
  ```

### Get User Profile

- **URL**: `/auth/profile/:userId`
- **Method**: `GET`
- **Auth**: Required
- **Response**:
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
        "createdAt": "string"
      }
    }
  }
  ```

### Update User Profile

- **URL**: `/auth/profile/:userId`
- **Method**: `PUT`
- **Auth**: Required
- **Body**:
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "birthDate": "string (YYYY-MM-DD)"
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 200,
    "message": "Profile updated successfully",
    "data": {
      "firstName": "string",
      "lastName": "string",
      "birthDate": "string",
      "createdAt": "string"
    }
  }
  ```

### Delete User (Admin Only)

- **URL**: `/auth/user/:userId`
- **Method**: `DELETE`
- **Auth**: Required (ADMIN role only)
- **Response**:
  ```json
  {
    "statusCode": 200,
    "message": "User deleted successfully"
  }
  ```

### Get All Users (Admin Only)

- **URL**: `/auth/users`
- **Method**: `GET`
- **Auth**: Required (ADMIN role only)
- **Response**:
  ```json
  {
    "statusCode": 200,
    "data": [
      {
        "id": "string",
        "email": "string",
        "role": "string",
        "createdAt": "string",
        "profile": {
          "firstName": "string",
          "lastName": "string",
          "birthDate": "string",
          "createdAt": "string"
        }
      }
    ]
  }
  ```

## Error Responses

### Common error response format:

```json
{
  "statusCode": number,
  "message": "string",
  "error": "string"
}
```

### Common Status Codes:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
