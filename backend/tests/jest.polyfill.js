// Runs before any test file. Do not import app or config here.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'jest-integration-secret-key-min-32-chars!!';
