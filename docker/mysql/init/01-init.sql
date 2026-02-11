-- Carmen Database Initialization Script
-- This script runs when the MySQL container is first created

-- Set character set
SET NAMES utf8mb4;

-- Grant privileges to carmen_user
GRANT ALL PRIVILEGES ON Carmen_Dev.* TO 'carmen_user'@'%';
FLUSH PRIVILEGES;

-- Use the database
USE Carmen_Dev;

-- Note: Actual table creation is handled by EF Core migrations
-- This script is for initial setup only
