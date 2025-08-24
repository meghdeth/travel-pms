// Jest setup file for global test configuration
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Global test setup
global.beforeAll(async () => {
  // Setup test database or other global test configurations
});

global.afterAll(async () => {
  // Cleanup after all tests
});