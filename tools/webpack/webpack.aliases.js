const { createWebpackAliases } = require("./webpack.helpers");

// Export aliases
module.exports = createWebpackAliases({
  "@assets": "assets",
  "@components": "src/renderer/components",
  "@common": "src/common",
  "@main": "src/main",
  "@renderer": "src/renderer",
  "@src": "src",
  "@misc": "misc",
  "@models": "src/common/models",
  "@lib": "src/common/lib",
  "@store": "src/renderer/store",
  "@pages": "src/renderer/pages",
  "@images": "assets/images",
  "@tools": "tools",
});
