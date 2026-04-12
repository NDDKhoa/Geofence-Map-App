/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/tests/jest.polyfill.js'],
    setupFilesAfterEnv: ['<rootDir>/tests/setupAfterEnv.js'],
    testMatch: ['**/tests/**/*.test.js'],
    testTimeout: 60000,
    maxWorkers: 1,
    forceExit: true,
    verbose: true
};
