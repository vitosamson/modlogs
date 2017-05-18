const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const isDevelopment = process.env.NODE_ENV === 'development';

const plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
    },
  }),
];

const entry = [
  'es6-shim',
  'isomorphic-fetch',
  './index.tsx',
];

if (isDevelopment) {
  entry.unshift('webpack/hot/only-dev-server');
  entry.unshift('react-hot-loader/patch');
  plugins.push(new webpack.HotModuleReplacementPlugin());
  plugins.push(new webpack.NamedModulesPlugin());
  plugins.push(new webpack.NoEmitOnErrorsPlugin());
} else {
  plugins.push(new ExtractTextPlugin('style.css'));
  plugins.push(new UglifyJsPlugin());
}

module.exports = {
  devtool: isDevelopment && 'source-map',
  entry,
  output: {
    path: path.resolve('../../build/assets'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.scss'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'awesome-typescript-loader',
        exclude: /node_modules/,
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        use: 'source-map-loader',
      },
      {
        test: /\.scss$/,
        use: isDevelopment ?
          ['style-loader', 'css-loader', 'sass-loader'] :
          ExtractTextPlugin.extract({
            use: ['css-loader', 'sass-loader'],
          }),
      },
    ],
  },
  plugins,

  devServer: !isDevelopment ? undefined : {
    hot: true,
    contentBase: path.resolve('./'),
    publicPath: '/',
    historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:4245',
      '/': {
        target: 'http://localhost:4245',
        bypass(req, res, proxyOptions) {
          return !req.headers.accept.includes('html');
        },
      },
    },
  },
};
