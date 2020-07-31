const path = require('path')

module.exports = {
  configureWebpack: {
    node: {
      module: 'empty',
    },
    resolve: {
      alias: {
        config: path.resolve(`src/config/${process.env.NODE_ENV}.js`),
      },
    },
  },
  transpileDependencies: ['vuetify'],
}
