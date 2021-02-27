const path = require("path");

/** @type {import('bili').Config} */
const config = {
  input: "./src/index.ts",
  output: {
    moduleName: "Package",
    format: ["cjs", "esm"],
    dir: "./lib"
  },
  plugins: {
    typescript2: {
      cacheRoot: path.join(__dirname, ".rpt2_cache")
    }
  }
};

module.exports = config