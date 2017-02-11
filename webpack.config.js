require('dotenv').config();

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');

const inDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  context: path.resolve(__dirname, "src"),
  entry: [
    './index.js'
  ].concat(inDevelopment ? [
    'webpack-hot-middleware/client'
  ] : []),

  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: '/',
    filename: 'bundle.js'
  },

  resolve: {
    extensions: ['', '.jsx', '.js', '.json', '.scss'],
    modulesDirectories: [
      path.resolve(__dirname, "src/lib"),
      path.resolve(__dirname, "node_modules"),
      'node_modules'
    ],
    alias: {
      components: path.resolve(__dirname, "src/components"), // used for tests
      style: path.resolve(__dirname, "src/style")
    }
  },

  module: {
    noParse: [new RegExp('node_modules/localforage/dist/localforage.js')],
    preLoaders: [
      {
        test: /\.jsx?$/,
        exclude: /src\//,
        loader: 'source-map'
      }
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.(scss|css)$/,
        include: /src\/components\//,
        loader: ExtractTextPlugin.extract('style?singleton', [
          `css?sourceMap=${inDevelopment}&modules&importLoaders=1&localIdentName=[local]${process.env.CSS_MODULES_IDENT || '_[hash:base64:5]'}`,
          'postcss',
          `sass?sourceMap=${inDevelopment}`
        ].join('!'))
      },
      {
        test: /\.(scss|css)$/,
        exclude: /src\/components\//,
        loader: ExtractTextPlugin.extract('style?singleton', [
          `css?sourceMap=${inDevelopment}`,
          `postcss`,
          `sass?sourceMap=${inDevelopment}`
        ].join('!'))
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif)(\?.*)?$/i,
        loader: inDevelopment ? 'url' : 'file?name=[path][name]_[hash:base64:5].[ext]'
      }
    ]
  },

  postcss: () => [
    autoprefixer({ browsers: 'last 2 versions' })
  ],

  plugins: ([
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('style.css', {
      allChunks: true,
      disable: inDevelopment
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        NODE_ENV: process.env.NODE_ENV || 'development',
        VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY
      })
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      minify: { collapseWhitespace: true }
    }),
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, 'src/sw.js')
    })
  ]),

  stats: { colors: true },

  node: {
    global: true,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
    setImmediate: false
  },

  devtool: inDevelopment ?  'cheap-module-eval-source-map' : 'source-map',

  devServer: {
    port: process.env.PORT || 8080,
    host: '0.0.0.0',
    colors: true,
    publicPath: '/',
    contentBase: './src',
    historyApiFallback: true
  }
};
