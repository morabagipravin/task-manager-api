# Task Manager API

A comprehensive REST API for task management with JWT authentication, file uploads, and MySQL database integration.

## Features

- 🔐 **JWT Authentication** (1-hour token expiry)
- 👤 **User Management** (register, login, profile management)
- 📝 **Task Management** (CRUD operations with file attachments)
- 📄 **File Uploads** (using Multer with 10MB limit)
- 🔍 **Cursor-based & Page-based Pagination**
- 📊 **Task Statistics**
- 🛡️ **Password Hashing** (bcryptjs)
- 🗄️ **MySQL Database** with plain queries
- ✅ **Input Validation**

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (using mysql2)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Uploads**: Multer
- **CORS**: cors middleware

## Project Structure

```
task-manager-api/
│── package.json
│── server.js
│── config/
│   └── db.js                 # Database connection
│── migrations/
│   └── create_tables.sql     # Database schema
│── models/
│   ├── userModel.js         # User data access layer
│   └── taskModel.js         # Task data access layer
│── services/
│   ├── authService.js       # Authentication business logic
│   └── taskService.js       # Task business logic
│── controllers/
│   ├── authController.js    # Auth request handlers
│   └── taskController.js    # Task request handlers
│── routes/
│   ├── authRoutes.js        # Auth endpoints
│   └── taskRoutes.js        # Task endpoints
│── middleware/
│   └── authMiddleware.js    # JWT authentication middleware
│── uploads/                 # File storage directory
│── utils/
│   └── fileHandler.js       # File upload utilities
│── README.md
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
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=task_manager

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h

# Server Configuration
PORT=3000
```

### 3. Database Setup

#### Option A: Run SQL Script
```bash
mysql -u root -p < migrations/create_tables.sql
```

#### Option B: Manual Setup
1. Create database: `CREATE DATABASE task_manager;`
2. Run the SQL commands from `migrations/create_tables.sql`

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

#### 1. Register User
**POST** `/api/auth/register`

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
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login User
**POST** `/api/auth/login`

```json
{
  "identifier": "john@example.com",
  "password": "password123"
}
```

*Note: identifier can be either email or username*

#### 3. Get User Profile
**GET** `/api/auth/profile`

*Headers: Authorization: Bearer <token>*

#### 4. Update Profile
**PUT** `/api/auth/profile`

```json
{
  "username": "johnsmith",
  "email": "johnsmith@example.com"
}
```

#### 5. Delete Account
**DELETE** `/api/auth/account`

#### 6. Refresh Token
**POST** `/api/auth/refresh-token`

### Task Management Endpoints

*All task endpoints require authentication header: `Authorization: Bearer <token>`*

#### 1. Create Task
**POST** `/api/tasks`

**Form Data:**
```
title: "Complete project documentation"
description: "Write comprehensive API documentation"
dueDate: "2024-12-31"
status: "pending"
file: [file upload]
```

#### 2. Get All Tasks (Paginated)
**GET** `/api/tasks`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (max: 100, default: 10)
- `status`: Filter by status (`pending` or `completed`)
- `sortBy`: Sort field (`id`, `title`, `due_date`, `status`, `created_at`, `updated_at`)
- `sortOrder`: Sort direction (`ASC` or `DESC`)

**Example:** `/api/tasks?page=1&limit=5&status=pending&sortBy=due_date&sortOrder=ASC`

#### 3. Get All Tasks (Cursor-based Pagination)
**GET** `/api/tasks`

**Query Parameters:**
- `cursor`: Last task ID from previous page
- `limit`: Items per page (max: 100, default: 10)
- `status`: Filter by status

**Example:** `/api/tasks?cursor=25&limit=10&status=completed`

#### 4. Get Single Task
**GET** `/api/tasks/:id`

#### 5. Update Task
**PUT** `/api/tasks/:id`

**Form Data:**
```
title: "Updated task title"
description: "Updated description"
status: "completed"
file: [new file upload - optional]
```

#### 6. Delete Task
**DELETE** `/api/tasks/:id`

#### 7. Get Task Statistics
**GET** `/api/tasks/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 25,
      "pending": 15,
      "completed": 10
    }
  }
}
```

#### 8. Download Task File
**GET** `/api/tasks/:id/download`

## Postman Examples

### 1. Register User

```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Login User

```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "identifier": "test@example.com",
  "password": "password123"
}
```

### 3. Create Task with File

```
POST http://localhost:3000/api/tasks
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

Form Data:
- title: "My First Task"
- description: "This is a test task"
- dueDate: "2024-12-31"
- status: "pending"
- file: [select a file]
```

### 4. Get Tasks with Pagination

```
GET http://localhost:3000/api/tasks?page=1&limit=5&status=pending
Authorization: Bearer YOUR_JWT_TOKEN
```

### 5. Get Tasks with Cursor Pagination

```
GET http://localhost:3000/api/tasks?cursor=10&limit=5
Authorization: Bearer YOUR_JWT_TOKEN
```

### 6. Update Task

```
PUT http://localhost:3000/api/tasks/1
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

Form Data:
- title: "Updated Task Title"
- status: "completed"
```

### 7. Get User Profile

```
GET http://localhost:3000/api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

### 8. Get Task Statistics

```
GET http://localhost:3000/api/tasks/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date DATE,
  status ENUM('pending', 'completed') DEFAULT 'pending',
  file_path VARCHAR(500),
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## File Upload

- **Supported formats**: Images (JPG, PNG, GIF), PDF, Word documents, Excel files, text files
- **File size limit**: 10MB per file
- **Storage**: Files are stored in the `/uploads` directory
- **Naming**: Files are renamed with timestamp and random suffix for uniqueness
- **Access**: Files can be downloaded via `/api/tasks/:id/download` or accessed directly at `/uploads/filename`

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

## Development Notes

- Uses plain MySQL queries (no ORM)
- Follows layered architecture: Routes → Controllers → Services → Models
- Implements both cursor-based and page-based pagination
- Supports hard delete for tasks
- Files are automatically deleted when tasks are deleted
- Token refresh endpoint available for extending sessions

## License

MIT License