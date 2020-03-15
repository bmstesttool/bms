const path = require('path');

const resolve = (dir) => path.join(__dirname, dir);

module.exports = {
  publicPath: './',
  devServer: {
    host: '0.0.0.0',
    port: 8080,
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src'));
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        win: {
          target: 'nsis',
        },
        mac: {
          target: 'dmg',
        },
        linux: {
          target: 'deb',
        },
      },
    },
  },
};
