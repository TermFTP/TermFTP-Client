const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
    alias: {
      // Custom Aliases
      ...require("./webpack.aliases"),
    },
    fallback: {
      fs: false,
      path: require.resolve("path-browserify"),
      module: false,
      dgram: false,
      dns: require.resolve("dns"),
      http2: false,
      net: false,
      tls: false,
      child_process: false,
      os: false,
      crypto: false,
    },
  },
  stats: "minimal",
  /**
   * Fix: Enable inline-source-map to fix following:
   * Dev tools: unable to load source maps over custom protocol
   */
  devtool: "inline-source-map",
  target: "electron-renderer",
};
