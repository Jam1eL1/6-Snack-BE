module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/src/test/setupEnv.ts"],
  testMatch: ["**/*.test.ts"],
};
