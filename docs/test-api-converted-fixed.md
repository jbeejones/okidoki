---
title: API Reference (Fixed)
description: API documentation generated from OpenAPI specification
---

# OkiOki Test API

A comprehensive test API specification to demonstrate OpenAPI to Markdown conversion in OkiOki.

This API includes various endpoint types, authentication methods, and data models to showcase
the full capabilities of the conversion feature.

## Features Demonstrated
- Multiple HTTP methods (GET, POST, PUT, DELETE)
- Path, query, and header parameters
- Request and response bodies
- Authentication with API keys
- Complex nested data models
- Error handling
- File uploads


**Version:** 2.1.0

## Contact

**Name:** OkiOki API Team

**Email:** api-team@okidoki.dev

**URL:** https://okidoki.dev/support

## Base URLs

- **https://api.okidoki.dev/v2** - Production server
- **https://staging-api.okidoki.dev/v2** - Staging server
- **http://localhost:3000/v2** - Development server

## Endpoints

### ![GET](https://img.shields.io/badge/GET-get-brightgreen?style=flat-square =80x20) /users

**Summary:** List users

Retrieve a paginated list of users with optional filtering

#### Parameters

| Name | In | Type | Required | Description |
|------|----|----|----------|-------------|
| page | query | integer | No | Page number for pagination |
| limit | query | integer | No | Number of users per page |
| status | query | string | No | Filter users by status |
| search | query | string | No | Search users by name or email |

#### Responses

{{#tabs}}
  {{#tab title="200"}}
List of users retrieved successfully

**Content-Type:** `application/json`

```json
{
  "type": "object",
  "properties": {
    "users": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/User"
      }
    },
    "pagination": {
      "$ref": "#/components/schemas/PaginationInfo"
    }
  }
}
```

**References:** [User](#user), [PaginationInfo](#paginationinfo)

  {{/tab}}
  {{#tab title="400"}}
No response body.

  {{/tab}}
  {{#tab title="401"}}
No response body.

  {{/tab}}
  {{#tab title="500"}}
No response body.

  {{/tab}}
{{/tabs}}

---

### ![POST](https://img.shields.io/badge/POST-post-blue?style=flat-square =80x20) /users

**Summary:** Create user

Create a new user account

#### Request Body

User data for account creation

**Content-Type:** `application/json`

**Schema:**

```json
{
  "$ref": "#/components/schemas/CreateUserRequest"
}
```

**References:** [CreateUserRequest](#createuserrequest)

**Content-Type:** `application/xml`

**Schema:**

```json
{
  "$ref": "#/components/schemas/CreateUserRequest"
}
```

**References:** [CreateUserRequest](#createuserrequest)

#### Responses

{{#tabs}}
  {{#tab title="201"}}
User created successfully

**Content-Type:** `application/json`

```json
{
  "$ref": "#/components/schemas/User"
}
```

**References:** [User](#user)

  {{/tab}}
  {{#tab title="400"}}
No response body.

  {{/tab}}
  {{#tab title="409"}}
User already exists

**Content-Type:** `application/json`

```json
{
  "$ref": "#/components/schemas/ErrorResponse"
}
```

**References:** [ErrorResponse](#errorresponse)

  {{/tab}}
{{/tabs}}

---

### ![GET](https://img.shields.io/badge/GET-get-brightgreen?style=flat-square =80x20) /users/{userId}

**Summary:** Get user by ID

Retrieve detailed information about a specific user

#### Parameters

| Name | In | Type | Required | Description |
|------|----|----|----------|-------------|
| userId | path | string | Yes | Unique identifier for the user |
| include | query | array | No | Additional data to include in response |

#### Responses

{{#tabs}}
  {{#tab title="200"}}
User details retrieved successfully

**Content-Type:** `application/json`

```json
{
  "$ref": "#/components/schemas/UserDetailed"
}
```

**References:** [UserDetailed](#userdetailed)

  {{/tab}}
  {{#tab title="404"}}
No response body.

  {{/tab}}
{{/tabs}}

---

### ![PUT](https://img.shields.io/badge/PUT-put-orange?style=flat-square =80x20) /users/{userId}

**Summary:** Update user

Update user information

#### Parameters

| Name | In | Type | Required | Description |
|------|----|----|----------|-------------|
| userId | path | string | Yes |  |

#### Request Body

**Content-Type:** `application/json`

**Schema:**

```json
{
  "$ref": "#/components/schemas/UpdateUserRequest"
}
```

**References:** [UpdateUserRequest](#updateuserrequest)

#### Responses

{{#tabs}}
  {{#tab title="200"}}
User updated successfully

**Content-Type:** `application/json`

```json
{
  "$ref": "#/components/schemas/User"
}
```

**References:** [User](#user)

  {{/tab}}
  {{#tab title="404"}}
No response body.

  {{/tab}}
{{/tabs}}

---

### ![DELETE](https://img.shields.io/badge/DELETE-delete-red?style=flat-square =80x20) /users/{userId}

**Summary:** Delete user

Permanently delete a user account

#### Parameters

| Name | In | Type | Required | Description |
|------|----|----|----------|-------------|
| userId | path | string | Yes |  |
| X-Confirm-Delete | header | string | Yes | Confirmation header required for deletion |

#### Responses

{{#tabs}}
  {{#tab title="204"}}
User deleted successfully

No response body.

  {{/tab}}
  {{#tab title="404"}}
No response body.

  {{/tab}}
{{/tabs}}

---

### ![POST](https://img.shields.io/badge/POST-post-blue?style=flat-square =80x20) /users/{userId}/avatar

**Summary:** Upload user avatar

Upload an avatar image for a user

#### Parameters

| Name | In | Type | Required | Description |
|------|----|----|----------|-------------|
| userId | path | string | Yes |  |

#### Request Body

**Content-Type:** `multipart/form-data`

**Schema:**

```json
{
  "type": "object",
  "properties": {
    "avatar": {
      "type": "string",
      "format": "binary",
      "description": "Avatar image file (JPEG, PNG)"
    },
    "description": {
      "type": "string",
      "description": "Optional description for the avatar"
    }
  }
}
```

#### Responses

**200** - Avatar uploaded successfully

*Content-Type:* `application/json`

```json
{
  "type": "object",
  "properties": {
    "avatarUrl": {
      "type": "string",
      "format": "uri",
      "example": "https://cdn.okidoki.dev/avatars/123e4567.jpg"
    }
  }
}
```

---

### ![GET](https://img.shields.io/badge/GET-get-brightgreen?style=flat-square =80x20) /projects

**Summary:** List projects

Get a list of projects with filtering options

#### Parameters

| Name | In | Type | Required | Description |
|------|----|----|----------|-------------|
| status | query | string | No |  |
| owner | query | string | No |  |

#### Responses

**200** - Projects retrieved successfully

*Content-Type:* `application/json`

```json
{
  "type": "array",
  "items": {
    "$ref": "#/components/schemas/Project"
  }
}
```

**References:** [Project](#project)

---

## Data Models

### User {#user}

```json
{
  "type": "object",
  "required": [
    "id",
    "email",
    "name",
    "status",
    "createdAt"
  ],
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique identifier for the user",
      "example": "123e4567-e89b-12d3-a456-426614174000"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "User's email address",
      "example": "john.doe@example.com"
    },
    "name": {
      "type": "string",
      "description": "User's full name",
      "example": "John Doe",
      "minLength": 2,
      "maxLength": 100
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "inactive",
        "pending"
      ],
      "description": "Current user status",
      "example": "active"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "description": "User creation timestamp",
      "example": "2023-01-15T10:30:00Z"
    },
    "lastLoginAt": {
      "type": "string",
      "format": "date-time",
      "description": "Last login timestamp",
      "example": "2023-11-20T14:25:30Z",
      "nullable": true
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "User tags for categorization",
      "example": [
        "premium",
        "beta-tester"
      ]
    }
  }
}
```

### UserDetailed {#userdetailed}

```json
{
  "allOf": [
    {
      "$ref": "#/components/schemas/User"
    },
    {
      "type": "object",
      "properties": {
        "profile": {
          "$ref": "#/components/schemas/UserProfile"
        },
        "settings": {
          "$ref": "#/components/schemas/UserSettings"
        },
        "stats": {
          "$ref": "#/components/schemas/UserStats"
        }
      }
    }
  ]
}
```

### UserProfile {#userprofile}

```json
{
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string",
      "example": "John"
    },
    "lastName": {
      "type": "string",
      "example": "Doe"
    },
    "avatar": {
      "type": "string",
      "format": "uri",
      "example": "https://cdn.okidoki.dev/avatars/123e4567.jpg"
    },
    "bio": {
      "type": "string",
      "description": "User biography",
      "example": "Software developer passionate about API design",
      "maxLength": 500
    },
    "location": {
      "type": "string",
      "example": "San Francisco, CA"
    },
    "website": {
      "type": "string",
      "format": "uri",
      "example": "https://johndoe.dev"
    }
  }
}
```

### UserSettings {#usersettings}

```json
{
  "type": "object",
  "properties": {
    "theme": {
      "type": "string",
      "enum": [
        "light",
        "dark",
        "auto"
      ],
      "default": "auto"
    },
    "notifications": {
      "type": "object",
      "properties": {
        "email": {
          "type": "boolean",
          "default": true
        },
        "push": {
          "type": "boolean",
          "default": false
        },
        "sms": {
          "type": "boolean",
          "default": false
        }
      }
    },
    "privacy": {
      "type": "object",
      "properties": {
        "profileVisible": {
          "type": "boolean",
          "default": true
        },
        "showActivity": {
          "type": "boolean",
          "default": false
        }
      }
    }
  }
}
```

### UserStats {#userstats}

```json
{
  "type": "object",
  "properties": {
    "projectsCount": {
      "type": "integer",
      "example": 15
    },
    "documentsCreated": {
      "type": "integer",
      "example": 42
    },
    "lastActivity": {
      "type": "string",
      "format": "date-time",
      "example": "2023-11-20T16:45:00Z"
    }
  }
}
```

### CreateUserRequest {#createuserrequest}

```json
{
  "type": "object",
  "required": [
    "email",
    "name",
    "password"
  ],
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "example": "jane.doe@example.com"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100,
      "example": "Jane Doe"
    },
    "password": {
      "type": "string",
      "minLength": 8,
      "description": "User password (minimum 8 characters)",
      "example": "securePassword123"
    },
    "profile": {
      "$ref": "#/components/schemas/UserProfile"
    }
  }
}
```

### UpdateUserRequest {#updateuserrequest}

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "inactive"
      ]
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "profile": {
      "$ref": "#/components/schemas/UserProfile"
    }
  }
}
```

### Project {#project}

```json
{
  "type": "object",
  "required": [
    "id",
    "name",
    "status",
    "owner",
    "createdAt"
  ],
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "example": "456e7890-e89b-12d3-a456-426614174001"
    },
    "name": {
      "type": "string",
      "description": "Project name",
      "example": "Documentation Website"
    },
    "description": {
      "type": "string",
      "description": "Project description",
      "example": "A modern documentation website built with OkiOki"
    },
    "status": {
      "type": "string",
      "enum": [
        "draft",
        "active",
        "completed",
        "archived"
      ],
      "example": "active"
    },
    "owner": {
      "$ref": "#/components/schemas/User"
    },
    "members": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/User"
      }
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "example": "2023-10-01T09:00:00Z"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time",
      "example": "2023-11-15T11:30:00Z"
    }
  }
}
```

### PaginationInfo {#paginationinfo}

```json
{
  "type": "object",
  "properties": {
    "page": {
      "type": "integer",
      "example": 1
    },
    "limit": {
      "type": "integer",
      "example": 20
    },
    "total": {
      "type": "integer",
      "example": 150
    },
    "pages": {
      "type": "integer",
      "example": 8
    },
    "hasNext": {
      "type": "boolean",
      "example": true
    },
    "hasPrev": {
      "type": "boolean",
      "example": false
    }
  }
}
```

### ErrorResponse {#errorresponse}

```json
{
  "type": "object",
  "required": [
    "error",
    "message",
    "timestamp"
  ],
  "properties": {
    "error": {
      "type": "string",
      "description": "Error code",
      "example": "VALIDATION_ERROR"
    },
    "message": {
      "type": "string",
      "description": "Human-readable error message",
      "example": "The provided email address is already in use"
    },
    "details": {
      "type": "object",
      "description": "Additional error details",
      "example": {
        "field": "email",
        "code": "DUPLICATE_VALUE"
      }
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "Error occurrence timestamp",
      "example": "2023-11-20T15:30:45Z"
    },
    "requestId": {
      "type": "string",
      "description": "Unique request identifier for debugging",
      "example": "req_123456789"
    }
  }
}
```

