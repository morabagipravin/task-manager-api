const fs = require('fs');
const path = require('path');
const logger = require('./config/logger');

console.log('🚀 Task Manager API Setup');
console.log('========================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('Please create a .env file with the following variables:');
  console.log('DB_HOST=localhost');
  console.log('DB_USER=root');
  console.log('DB_PASS=yourpassword');
  console.log('DB_NAME=task_manager');
  console.log('JWT_SECRET=your_jwt_secret');
  console.log('PORT=3000\n');
  process.exit(1);
}

console.log('✅ .env file found');

// Check if uploads directory exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
  console.log('✅ Created uploads directory');
} else {
  console.log('✅ uploads directory exists');
}

// Check if logs directory exists
const logsPath = path.join(__dirname, 'logs');
if (!fs.existsSync(logsPath)) {
  fs.mkdirSync(logsPath);
  console.log('✅ Created logs directory');
} else {
  console.log('✅ logs directory exists');
}

// Check if migration files exist
const usersMigrationPath = path.join(__dirname, 'migrations', 'users.sql');
const tasksMigrationPath = path.join(__dirname, 'migrations', 'tasks.sql');

if (!fs.existsSync(usersMigrationPath)) {
  console.log('❌ users.sql migration file not found!');
  process.exit(1);
}

if (!fs.existsSync(tasksMigrationPath)) {
  console.log('❌ tasks.sql migration file not found!');
  process.exit(1);
}

console.log('✅ Migration files found');

console.log('\n📋 Next Steps:');
console.log('1. Set up your MySQL database');
console.log('2. Run: mysql -u root -p < migrations/users.sql');
console.log('3. Run: mysql -u root -p < migrations/tasks.sql');
console.log('4. Test database connection: node test-db.js');
console.log('5. Start the server: npm start');
console.log('6. Import TaskManagerAPI.postman_collection.json into Postman for testing\n');

console.log('🎉 Setup completed!'); 