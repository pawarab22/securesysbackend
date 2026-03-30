# Secure API System Backend

This directory contains the Node.js/Express backend for the Secure API-Based Web Application. Below are the standard cURL commands to interact with the API endpoints.

> **Note**: For all protected routes (`/api/notes`, `/api/auth/me`), you must replace `<YOUR_JWT_TOKEN>` with the token received from the Login or Register response. For PUT/DELETE endpoints, replace `<NOTE_ID>` with the actual UUID of the note.

## Quick Start Commands

To quickly set up and start the project:

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables in `.env` (see Setup section below for details).

3. Start the development server:
   ```
   npm run dev
   ```

The server will run on `http://localhost:5000` by default.

## Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)
- PostgreSQL database

### Installation
1. Clone the repository and navigate to the backend directory.
2. Install dependencies:
   ```
   npm install
   ```

### Environment Configuration
1. Ensure PostgreSQL is running on your system.
2. Create a database named `secure_api_db` (or update `DB_NAME` in `.env` if using a different name).
3. Copy the `.env` file and configure the following variables:
   - `DB_HOST`: Database host (default: localhost)
   - `DB_PORT`: Database port (default: 5432)
   - `DB_USER`: Database username
   - `DB_PASSWORD`: Database password
   - `DB_NAME`: Database name (default: secure_api_db)
   - `JWT_SECRET`: Secret key for JWT tokens
   - `JWT_EXPIRES_IN`: JWT expiration time (default: 1h)
   - `PORT`: Server port (default: 5000)

### Running the Application
- For development (with auto-restart): `npm run dev`
- For production: `npm start` (if configured)

The server will start on the specified port, and the database models will be automatically synchronized.

## Authentication API endpoints

### 1. Register a new user
Creates a new user and returns a JWT token.
```bash
curl -X POST http://localhost:5000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"email":"test@example.com", "password":"password123"}'
```

### 2. Login
Authenticates a user and returns a JWT token.
```bash
curl -X POST http://localhost:5000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"test@example.com", "password":"password123"}'
```

### 3. Get Current User (Protected)
Retrieves the profile of the currently authenticated user.
```bash
curl -X GET http://localhost:5000/api/auth/me \
-H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## Notes API endpoints

### 4. Create a Note (Protected)
Creates a new note for the authenticated user.
*Includes `Idempotency-Key` header testing to safely retry requests.*
```bash
curl -X POST http://localhost:5000/api/notes \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
-H "Idempotency-Key: a-unique-uuid-key-here" \
-d '{"title":"First Note", "content":"This is my secure note content."}'
```

### 5. Get all Notes (Protected)
Fetches all notes belonging to the authenticated user.
```bash
curl -X GET http://localhost:5000/api/notes \
-H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 6. Update a Note (Protected)
Updates an existing note by ID. 
*Includes `version` param for testing optimistic concurrency locking.*
```bash
curl -X PUT http://localhost:5000/api/notes/<NOTE_ID> \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
-d '{"title":"Updated Note Title", "content":"Updated content.", "version": 0}'
```

### 7. Delete a Note (Protected)
Deletes an existing note by ID.
```bash
curl -X DELETE http://localhost:5000/api/notes/<NOTE_ID> \
-H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## Testing Error Handling Edge Cases

#### Missing Auth Token (Expected: 401 Unauthorized)
```bash
curl -X GET http://localhost:5000/api/notes
```

#### Duplicate User Registration (Expected: 400 Bad Request)
```bash
curl -X POST http://localhost:5000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"email":"test@example.com", "password":"password123"}'
```

#### Validation Error (Expected: 400 Bad Request)
```bash
curl -X POST http://localhost:5000/api/notes \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
-d '{"content":"Title is missing, so this will fail via express-validator"}'
```

---

## Database Documentation

The project uses PostgreSQL with Sequelize ORM. The schema consists of two primary models: **User** and **Note**, which share a **One-to-Many** relationship.

### 1. `users` Table
Stores user authentication data.
- **`id`** (`UUID`, Primary Key) - Unique identifier for the user.
- **`email`** (`String`, Unique, Not Null) - User's login email address.
- **`password`** (`String`, Not Null) - Bcrypt hashed password.
- **`createdAt`** / **`updatedAt`** (`Date`) - Auto-managed Sequelize timestamps.

### 2. `notes` Table
Stores user-created notes. Includes Optimistic Locking to handle concurrency securely.
- **`id`** (`UUID`, Primary Key) - Unique identifier for the note.
- **`title`** (`String`, Not Null) - The title of the note.
- **`content`** (`Text`, Not Null) - The body/content of the note.
- **`userId`** (`UUID`, Foreign Key) - References `users.id` (ON DELETE CASCADE). Applies authorization.
- **`version`** (`Integer`, Default: 0) - Used for Optimistic Concurrency Control. Increments on every update to prevent conflicting concurrent edits.
- **`createdAt`** / **`updatedAt`** (`Date`) - Auto-managed Sequelize timestamps.

### Relationships
- A `User` `hasMany` `Note`s (Foreign Key: `userId`).
- A `Note` `belongsTo` a `User`.