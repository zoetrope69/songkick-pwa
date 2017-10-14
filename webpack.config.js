require('dotenv').config();

const webpack = require('webpack');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');

const path = require('path');

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

module.exports = {
  context: path.resolve(__dirname, "src"),
  entry: [
    './index.js'
  ].concat(IN_DEVELOPMENT ? [
    'webpack-hot-middleware/client'
  ] : []),

  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/',
    filename: 'bundle.js'
  },

  resolve: {
    extensions: ['.js', '.scss'],
    modules: [
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
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              'env', 'react', 'stage-0'
            ],
            plugins: [
              ["transform-decorators-legacy"],
              ["transform-react-jsx", { "pragma": "h" }]
            ]
          }
        }
      },
      {
        test: /\.(scss|css)$/,
        include: /src\/components\//,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader?singleton',
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 1,
                localIdentName: `[local]${process.env.CSS_MODULES_IDENT || '_[hash:base64:5]'}`,
                sourceMap: IN_DEVELOPMENT
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: IN_DEVELOPMENT,
                ident: 'postcss',
                plugins: (loader) => [
                  require('postcss-will-change'),
                  require('autoprefixer')({ browsers: 'last 2 versions' })
                ]
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: IN_DEVELOPMENT
              }
            }
          ]
        })
      },
      {
        test: /\.scss|css$/,
        exclude: /src\/components\//,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader?singleton',
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: IN_DEVELOPMENT
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: IN_DEVELOPMENT,
                ident: 'postcss',
                plugins: (loader) => [
                  require('postcss-will-change'),
                  require('autoprefixer')({ browsers: 'last 2 versions' })
                ]
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: IN_DEVELOPMENT
              }
            }
          ]
        })
      },
      {
        test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif)(\?.*)?$/i,
        use: IN_DEVELOPMENT ? [
          {
            loader: 'url-loader'
          }
        ] : [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name]_[hash:base64:5].[ext]'
            }
          }
        ]
      }
    ]
  },

  plugins: ([
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new ExtractTextPlugin('style.css', {
      allChunks: true,
      disable: IN_DEVELOPMENT
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        NODE_ENV: process.env.NODE_ENV || 'development',
        VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY
      })
    }),
    new HtmlWebpackPlugin({
      template: './index.ejs',
      minify: { collapseWhitespace: true }
    }),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'async'
    }),
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, 'src/sw.js')
    })
  ]).concat(!IN_DEVELOPMENT ? [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      output: {
        comments: false
      },
      compress: {
        warnings: false,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
        negate_iife: false
      }
    })
  ] : []),

  stats: { colors: true },

  node: {
    global: true,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
    setImmediate: false
  },

  devtool: IN_DEVELOPMENT ?  'cheap-module-eval-source-map' : 'source-map',

  devServer: {
    port: process.env.PORT || 8080,
    host: '0.0.0.0',
    colors: true,
    publicPath: '/',
    contentBase: './src',
    historyApiFallback: true
  }
};
