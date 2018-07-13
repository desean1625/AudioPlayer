const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');

const package = require('./package.json');

function noop() { }

module.exports = {
  entry: {
    audioplot: ['./src/AudioPlayer.js'],
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'dist/'
  },
  resolve: {
    alias: {
      '@audioplot': path.resolve(__dirname, 'src')
    },
  },
  externals: {
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                'transform-object-rest-spread',
                'angularjs-annotate',
              ],
              presets: [
                ['env', {
                  targets: { browsers: package.browserslist },
                  modules: false,
                }],
                'react',
              ],
            },
          },
        ]
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "postcss-loader"],
          publicPath: './'
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "postcss-loader", "sass-loader"],
          publicPath: './'
        })
      },
      {
        test:/\.(woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'},
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: { limit: 8192 }
          }
        ]
      },
      {
        test: /\.html?$/,
        use: [ 'html-loader' ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      __PRODUCTION__: JSON.stringify(process.env.NODE_ENV === 'production'),
    }),
    new ExtractTextPlugin({
      filename: '[name].css',
      allChunks: true,
    }),
    (function () {
      if (process.env.NODE_ENV !== 'production') {
        return noop;
      }
      return new UglifyJsPlugin();
    }()),
    (function () {
      if (process.env.NODE_ENV === 'production') {
        return noop;
      }
      return new webpack.SourceMapDevToolPlugin({
        filename: '[file].map',
        exclude: ['common.bundle.js']
      });
    }()),
  ],
  devServer: {
    inline: false
  }
};
