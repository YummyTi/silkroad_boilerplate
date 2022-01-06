/* eslint-disable indent */
process.env.NODE_ENV = 'production';
const path = require('path');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ImageminWebpack = require('image-minimizer-webpack-plugin');
const paths = require('../config/paths');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { appBuild, appPublic, appHtml } = paths;

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(appPublic, 'favicon.ico'),
          to: path.resolve(appBuild, 'favicon.ico'),
          toType: 'file',
        },
        {
          from: path.resolve(appPublic, 'static'),
          to: path.resolve(appBuild, 'static'),
          toType: 'dir',
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css',
      chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: appHtml,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new webpack.ProgressPlugin({
      modulesCount: 5000,
    }),
  ],
  output: {
    publicPath: '',
    pathinfo: true,
    filename: 'static/js/[name].[chunkhash].js',
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: 'static/js/[name].[chunkhash].chunk.js',
  },
  optimization: {
    nodeEnv: 'production',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    minimize: true,
    minimizer: [
      // This is only used in production mode
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
      }),
      // This is only used in production mode
      new CssMinimizerPlugin(),
      new UglifyJsPlugin(),
      new ImageminWebpack({
        severityError: 'warning', // Ignore errors on corrupted images
        minimizerOptions: {
          plugins: ['gifsicle'],
        },
        // Disable `loader`
        loader: false,
      }),
    ],
  },
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
});
