module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['**/__tests__/**/*.test.(ts|js)'],
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
  };