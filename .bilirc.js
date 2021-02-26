const path = require("path");

module.exports = {
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