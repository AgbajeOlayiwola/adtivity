// adtivity-sdk/jest.config.js
// Changed from module.exports to export default for ES Module compatibility
export default {
  // Use jsdom environment to simulate a browser for tests that rely on DOM APIs
  testEnvironment: "jsdom",

  // Configure Jest to transform JavaScript files using babel-jest
  // This ensures modern JS syntax (like class fields) is transpiled for Jest
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },

  // By default, Jest ignores node_modules.
  // If you had ES Modules within node_modules that needed transpilation for Jest,
  // you would adjust transformIgnorePatterns here. For this SDK, it's usually not needed.
  transformIgnorePatterns: [
    "/node_modules/", // Default: ignore all node_modules
    // Example if you needed to transpile a specific node_module:
    // '/node_modules/(?!some-es-module-package)/',
  ],

  // Module file extensions Jest should look for
  moduleFileExtensions: ["js", "json", "jsx", "node"],

  // Optional: Collect test coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.js", // Collect coverage from all .js files in src/
    "!src/index.js", // Exclude main entry if it only exports others (optional)
    // Add more specific exclusions/inclusions as needed
  ],

  // Setup files to run before each test suite (e.g., for global mocks or setup)
  setupFilesAfterEnv: [], // No specific setup file needed for now
}
