import type { Config } from "jest";

const config: Config = {
  preset:        "ts-jest",
  testEnvironment: "node",
  rootDir:       ".",
  testMatch:     ["**/tests/**/*.test.ts"],
  moduleNameMapper: {
    "^@config/(.*)$":      "<rootDir>/src/config/$1",
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^@middleware/(.*)$":  "<rootDir>/src/middleware/$1",
    "^@models/(.*)$":      "<rootDir>/src/models/$1",
    "^@routes/(.*)$":      "<rootDir>/src/routes/$1",
    "^@services/(.*)$":    "<rootDir>/src/services/$1",
    "^@sockets/(.*)$":     "<rootDir>/src/sockets/$1",
    "^@utils/(.*)$":       "<rootDir>/src/utils/$1",
    "^@validators/(.*)$":  "<rootDir>/src/validators/$1",
    "^@types-local/(.*)$": "<rootDir>/src/types/$1",
  },
  globalSetup:    "./tests/setup.ts",
  globalTeardown: "./tests/teardown.ts",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/server.ts",
    "!src/types/**",
  ],
  coverageDirectory: "coverage",
  verbose: true,
};

export default config;
