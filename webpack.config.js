const webpack = require('webpack')
const path = require('path')
const port = 4568

const config = {
  entry: {
    playground: './src/playground.js',
  },
  output: {
    filename: '[name].js',
    publicPath: '/',
  },
  module: {
    rules: [
      { test: /\.js?$/, exclude: /node_modules/, loader: 'babel-loader' },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  mode: "development",
  devServer: {
    port
  },
}

module.exports = config
