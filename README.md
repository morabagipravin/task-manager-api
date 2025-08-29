# Task Manager API

A comprehensive REST API for task management with JWT authentication, file uploads, and MySQL database integration.

## Features

- **JWT Authentication** (1-hour token expiry)
- **User Management** (signup, login)
- **Task Management** (CRUD operations with multiple file attachments)
- **File Uploads** (using Multer with 5MB limit per file, max 5 files)
- **Cursor-based Pagination**
- **Password Hashing** (bcryptjs)
- **MySQL Database** with plain SQL queries
- **Input Validation**
- **Winston Logging**

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
│   ├── create_tables.sql
├── uploads/
├── images/
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

You can run migrations in either of the following ways:

- Single command (creates DB and both tables):
```bash
mysql -u root -p < migrations/create_tables.sql
```

- Run individual table scripts:
```bash
mysql -u root -p < migrations/users.sql
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

## Postman Collection

A ready-to-use Postman collection is included in the repo: `TaskManagerAPI.postman_collection.json`.
- Import it into Postman and set `baseUrl` to `http://localhost:3000`.
- Use it to test all API endpoints quickly.

## API Endpoints

### Authentication Endpoints

#### 1. Signup User
**POST** `/auth/signup`


![Signup API](images/signUp.png)
![Signup API Mysql](images/mysqlSignUp.png)

```json
{
  "username": "testuser",
  "email": "test@example.com",
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
      "username": "testuser",
      "email": "test@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login User
**POST** `/auth/login`

![Login API](images/login.png)

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

*Note: You can also use username instead of email*

### Task Management Endpoints

## ⚠️ **IMPORTANT: Setting Authorization Header**

**After logging in, you MUST set the Authorization header for all protected operations:**

1. **Login first** using the "Login" request in Postman
2. **Copy the token** from the response (it looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
3. **Set the Authorization header** in Postman:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN_HERE`
   - Replace `YOUR_TOKEN_HERE` with the actual token you received

**Example:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYzMjU0NzIwMCwiZXhwIjoxNjMyNTUwODAwfQ.example_signature
```

**All task endpoints require this header!** Without it, you'll get "Unauthorized" errors.


#### 1. Create Task
**POST** `/tasks`

![Create Task](images/createTask.png)

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

![Create Task with Files](images/createTaskWithFiles.png)

#### 2. Get All Tasks (Cursor-based Pagination)
**GET** `/tasks`

**Query Parameters:**
- `cursor`: Last task ID from previous page
- `limit`: Items per page (max: 100, default: 10)
- `status`: Filter by status (`pending` or `completed`)

![Get Task with Cursor](images/getTaskWithCursor.png)
![Get Task by Status](images/getTaskByStatus.png)

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

![Get Task by ID](images/getTaskById.png)

#### 4. Update Task
**PUT** `/tasks/:id`

![Update Task](images/updateTask.png)

**JSON Body:**
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "completed"
}
```

![Update Task with Files](images/updateTaskWithFiles.png)

**Form Data (with files):**
```
title: "Updated task title"
description: "Updated description"
status: "completed"
files: [file1, file2, ...] (max 5 files)
```

#### 5. Delete Task
**DELETE** `/tasks/:id`

![Delete Task API](images/deteleTask.png)

#### 6. Download File
**GET** `/tasks/:id/download?file=FILENAME.EXT`

## Postman Collection (How to Use)

1. Import `TaskManagerAPI.postman_collection.json`
2. Set `baseUrl` to `http://localhost:3000`
3. Run the "Signup" request
4. Run the "Login" request and copy the token
5. Set the `token` variable
6. Test all other endpoints

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
- **Access**: Files can be downloaded via `/tasks/:id/download?file=FILENAME.EXT`
