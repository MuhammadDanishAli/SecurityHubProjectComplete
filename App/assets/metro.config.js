// metro.config.js
const path = require('path');

module.exports = {
  resolver: {
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'bmp'], // Add image file extensions
    extraNodeModules: {
      'assets': path.resolve(__dirname, 'assets'), // Add the assets folder
    },
  },
};
