
process.env.NODE_ENV = 'test';
process.env.DB_NAME = process.env.DB_NAME || 'leaderboard_test';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USERNAME = process.env.DB_USERNAME || 'harsh';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || '1234@Harsh';

jest.setTimeout(30000);
