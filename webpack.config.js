const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {

  mode: 'development',

  performance: {
    maxAssetSize: 1048576,
    maxEntrypointSize: 1048576,
  },

  entry: {
    webgl: './src/webgl.js',
    js: './src/javascript.js',
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: '[name]',
      filename: (entryName) => entryName + '.html',
      inject: false
    }),
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

  // file resolutions
  resolve: {
    extensions: ['.js' ],
    fallback: { 
      "path": false,
      "fs": false
    }
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|gltf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  
  devServer: {
    static: './dist',
    allowedHosts: 'auto'
  },

};