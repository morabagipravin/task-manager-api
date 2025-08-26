# Task Manager API

A comprehensive REST API for task management with JWT authentication, file uploads, and MySQL database integration.

## Features

- 🔐 **JWT Authentication** (1-hour token expiry)
- 👤 **User Management** (signup, login)
- 📝 **Task Management** (CRUD operations with multiple file attachments)
- 📄 **File Uploads** (using Multer with 5MB limit per file, max 5 files)
- 🔍 **Cursor-based Pagination**
- 🛡️ **Password Hashing** (bcryptjs)
- 🗄️ **MySQL Database** with plain SQL queries
- ✅ **Input Validation**
- 📝 **Winston Logging**

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (using mysql2)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Uploads**: Multer
- **Logging**: Winston
- **CORS**: cors middleware

## Project Structure

```
task-manager-api/
├── controllers/
│   ├── authController.js
│   ├── taskController.js
├── services/
│   ├── authService.js
│   ├── taskService.js
├── middlewares/
│   ├── authMiddleware.js
├── routes/
│   ├── authRoutes.js
│   ├── taskRoutes.js
├── config/
│   ├── db.js
│   ├── logger.js
├── migrations/
│   ├── users.sql
│   ├── tasks.sql
├── uploads/
├── app.js
├── package.json
├── .env
├── README.md
```

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd task-manager-api
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=task_manager
JWT_SECRET=your_jwt_secret
PORT=3000
```

### 3. Database Setup

#### Run SQL Migration Scripts

1. **Create users table:**
```bash
mysql -u root -p < migrations/users.sql
```

2. **Create tasks table:**
```bash
mysql -u root -p < migrations/tasks.sql
```

#### Manual Setup
1. Create database: `CREATE DATABASE task_manager;`
2. Run the SQL commands from `migrations/users.sql`
3. Run the SQL commands from `migrations/tasks.sql`

### 4. Start the Server

```bash
# Production
npm start

# Development (with nodemon)
npm run dev
```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication Endpoints

#### 1. Signup User
**POST** `/auth/signup`

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login User
**POST** `/auth/login`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

*Note: You can also use username instead of email*

### Task Management Endpoints

*All task endpoints require authentication header: `Authorization: Bearer <token>`*

#### 1. Create Task
**POST** `/tasks`

**JSON Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "dueDate": "2024-12-31",
  "status": "pending"
}
```

**Form Data (with files):**
```
title: "Complete project documentation"
description: "Write comprehensive API documentation"
dueDate: "2024-12-31"
status: "pending"
files: [file1, file2, ...] (max 5 files)
```

#### 2. Get All Tasks (Cursor-based Pagination)
**GET** `/tasks`

**Query Parameters:**
- `cursor`: Last task ID from previous page
- `limit`: Items per page (max: 100, default: 10)
- `status`: Filter by status (`pending` or `completed`)

**Example:** `/tasks?cursor=25&limit=10&status=completed`

**Response:**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [...],
    "pagination": {
      "hasMore": true,
      "nextCursor": 35
    }
  }
}
```

#### 3. Get Single Task
**GET** `/tasks/:id`

#### 4. Update Task
**PUT** `/tasks/:id`

**JSON Body:**
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "completed"
}
```

**Form Data (with files):**
```
title: "Updated task title"
description: "Updated description"
status: "completed"
files: [file1, file2, ...] (max 5 files)
```

#### 5. Delete Task
**DELETE** `/tasks/:id`

#### 6. Download File
**GET** `/tasks/:id/files/:fileName`

## Postman Collection

Import the `TaskManagerAPI.postman_collection.json` file into Postman for easy testing.

### How to use the Postman collection:

1. Import the JSON file into Postman
2. Set the `baseUrl` variable to `http://localhost:3000`
3. Run the "Signup" request to create a user
4. Run the "Login" request and copy the token from the response
5. Set the `token` variable with the copied token
6. Now you can test all other endpoints

## Database Schema

### Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  dueDate DATE,
  status ENUM('pending', 'completed') DEFAULT 'pending',
  filePaths JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

## File Upload

- **Supported formats**: Images (JPG, PNG, GIF), PDF, Word documents, text files
- **File size limit**: 5MB per file
- **Maximum files**: 5 files per task
- **Storage**: Files are stored in the `/uploads` directory
- **Naming**: Files are renamed with timestamp and random suffix for uniqueness
- **Access**: Files can be downloaded via `/tasks/:id/files/:fileName`

## Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs with salt rounds of 10
- **JWT Authentication**: Tokens expire after 1 hour
- **Input Validation**: Basic validation for required fields and data types
- **File Type Validation**: Only allowed file types can be uploaded
- **User Isolation**: Tasks are strictly tied to authenticated users
- **Hard Delete**: Tasks are permanently deleted from the database

## Logging

The application uses Winston for logging:
- Logs are stored in the `logs/` directory
- Console logging in development mode
- File logging for errors and combined logs
- Request logging for all API calls

## Development Notes

- Uses plain MySQL queries (no ORM)
- Follows layered architecture: Routes → Controllers → Services → Database
- Implements cursor-based pagination for better performance
- Supports multiple file uploads per task
- Files are automatically deleted when tasks are deleted
- JWT tokens expire after 1 hour as per requirements

## License

MIT License