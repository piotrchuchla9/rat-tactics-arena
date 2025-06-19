
module.exports = {
  appId: "com.ratdefense.app",
  productName: "Rat Defense 3D",
  directories: {
    output: "dist-electron"
  },
  files: [
    "dist/**/*",
    "public/electron.js",
    "node_modules/**/*"
  ],
  mac: {
    icon: "public/favicon.ico",
    category: "public.app-category.games"
  },
  win: {
    icon: "public/favicon.ico"
  },
  linux: {
    icon: "public/favicon.ico"
  }
};
