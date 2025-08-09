// adtivity-sdk/rollup.config.cjs
const resolve = require("@rollup/plugin-node-resolve")
const commonjs = require("@rollup/plugin-commonjs")
const babel = require("@rollup/plugin-babel")
const terser = require("@rollup/plugin-terser")
const pkg = require("./package.json") // Using require() for CommonJS config file

module.exports = {
  // Changed export default to module.exports
  input: "src/index.js",
  output: [
    {
      file: pkg.main, // CommonJS for Node environments
      format: "cjs",
      sourcemap: true,
    },
    {
      file: pkg.module, // ES Module for modern bundlers
      format: "esm",
      sourcemap: true,
    },
    {
      file: pkg.browser, // UMD for direct browser use (minified)
      format: "umd",
      name: "Adtivity", // Global variable name in browser
      sourcemap: true,
      plugins: [terser()], // Minify UMD output
    },
  ],
  plugins: [
    resolve.default(),
    commonjs.default(),
    babel.default({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      presets: [["@babel/preset-env", { targets: "> 0.25%, not dead" }]],
      plugins: [
        // Order matters: private methods usually before class properties
        ["@babel/plugin-proposal-private-methods", { loose: true }], // Added { loose: true }
        ["@babel/plugin-proposal-class-properties", { loose: true }], // Added { loose: true }
      ],
    }),
  ],
}
