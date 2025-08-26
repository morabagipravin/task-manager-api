const db = require('./config/db');
const logger = require('./config/logger');

async function testDatabase() {
  try {
    logger.info('Testing database connection...');
    
    // Test connection
    const connection = await db.getConnection();
    logger.info('Database connected successfully');
    connection.release();
    
    // Test if tables exist
    const [usersTable] = await db.execute("SHOW TABLES LIKE 'users'");
    const [tasksTable] = await db.execute("SHOW TABLES LIKE 'tasks'");
    
    if (usersTable.length > 0) {
      logger.info('Users table exists');
    } else {
      logger.warn('Users table does not exist. Please run migrations/users.sql');
    }
    
    if (tasksTable.length > 0) {
      logger.info('Tasks table exists');
    } else {
      logger.warn('Tasks table does not exist. Please run migrations/tasks.sql');
    }
    
    logger.info('Database test completed');
    process.exit(0);
    
  } catch (error) {
    logger.error('Database test failed:', error);
    process.exit(1);
  }
}

testDatabase(); 