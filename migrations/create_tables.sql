-- Create database if not exists
CREATE DATABASE IF NOT EXISTS task_manager;
USE task_manager;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date DATE,
  status ENUM('pending', 'completed') DEFAULT 'pending',
  file_path VARCHAR(500),
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Insert sample data (optional)
INSERT INTO users (username, email, password) VALUES 
('testuser', 'test@example.com', '$2a$10$example.hash.for.password123');

INSERT INTO tasks (title, description, due_date, status, user_id) VALUES 
('Sample Task', 'This is a sample task', '2024-12-31', 'pending', 1);