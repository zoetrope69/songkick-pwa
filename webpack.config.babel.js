import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ServiceWorkerWebpackPlugin from 'serviceworker-webpack-plugin';
import autoprefixer from 'autoprefixer';
import path from 'path';

const ENV = process.env.NODE_ENV || 'development';

const CSS_MAPS = ENV!=='production';

module.exports = {
  context: path.resolve(__dirname, "src"),
  entry: './index.js',

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
          `css?sourceMap=${CSS_MAPS}&modules&importLoaders=1&localIdentName=[local]${process.env.CSS_MODULES_IDENT || '_[hash:base64:5]'}`,
          'postcss',
          `sass?sourceMap=${CSS_MAPS}`
        ].join('!'))
      },
      {
        test: /\.(scss|css)$/,
        exclude: /src\/components\//,
        loader: ExtractTextPlugin.extract('style?singleton', [
          `css?sourceMap=${CSS_MAPS}`,
          `postcss`,
          `sass?sourceMap=${CSS_MAPS}`
        ].join('!'))
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.(xml|html|txt|md)$/,
        loader: 'raw'
      },
      {
        test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif)(\?.*)?$/i,
        loader: ENV==='production' ? 'file?name=[path][name]_[hash:base64:5].[ext]' : 'url'
      }
    ]
  },

  postcss: () => [
    autoprefixer({ browsers: 'last 2 versions' })
  ],

  plugins: ([
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('style.css', {
      allChunks: true,
      disable: ENV!=='production'
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({ NODE_ENV: ENV })
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      minify: { collapseWhitespace: true }
    }),
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, 'src/service-worker.js')
    })
  ]).concat(ENV==='production' ? [
    new webpack.optimize.OccurenceOrderPlugin()
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

  devtool: ENV==='production' ? 'source-map' : 'cheap-module-eval-source-map',

  devServer: {
    port: process.env.PORT || 8080,
    host: '0.0.0.0',
    colors: true,
    publicPath: '/',
    contentBase: './src',
    historyApiFallback: true,
    proxy: [
      // OPTIONAL: proxy configuration:
      // {
      //   path: '/optional-prefix/**',
      //   target: 'http://target-host.com',
      //   rewrite: req => { req.url = req.url.replace(/^\/[^\/]+\//, ''); }   // strip first path segment
      // }
    ]
  }
};
