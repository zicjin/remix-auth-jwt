/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+.[tj]sx?$": [
      "ts-jest",
      {
        isolatedModules: true,
        tsconfig: {
          allowImportingTsExtensions: true,
        },
      },
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!(remix-auth))/"],
};
