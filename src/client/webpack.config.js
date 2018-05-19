const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const isDevelopment = process.env.NODE_ENV === 'development';

const plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
      ANALYTICS_KEY: JSON.stringify(process.env.ANALYTICS_KEY),
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

  plugins.push(function() {
    this.plugin('done', stats => {
      fs.writeFileSync(
        path.resolve('../../build/client/assets.json'),
        JSON.stringify({
          appScriptHref: '/bundle.js',
        }, null, 2)
      );
    });
  });
} else {
  if (!process.env.ANALYTICS_KEY) {
    console.warn('*** no analytics key was provided ***');
  }

  plugins.push(new ExtractTextPlugin('app-[contenthash].css'));
  plugins.push(new webpack.HashedModuleIdsPlugin());
  plugins.push(new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: m => /node_modules/.test(m.context),
  }));
  plugins.push(new webpack.optimize.CommonsChunkPlugin({
    name: 'manifest',
  }));
  plugins.push(new UglifyJsPlugin());
  plugins.push(new webpack.LoaderOptionsPlugin({
    minimize: true,
  }));

  plugins.push(function() {
    this.plugin('done', stats => {
      const chunks = stats.toJson().assetsByChunkName;
      const vendorJs = chunks.vendor;
      const appJs = chunks.app.find(c => path.extname(c) === '.js');
      const appCss = chunks.app.find(c => path.extname(c) === '.css');
      const webpackManifestFilename = chunks.manifest;
      const webpackManifest = fs.readFileSync(
        path.resolve(`../../build/assets/${webpackManifestFilename}`)
      ).toString();
      const relativeToAssets = chunk => `/assets/${chunk}`;

      fs.writeFileSync(
        path.resolve('../../build/client/assets.json'),
        JSON.stringify({
          webpackManifest,
          cssHref: relativeToAssets(appCss),
          vendorScriptHref: relativeToAssets(vendorJs),
          appScriptHref: relativeToAssets(appJs),
        }, null, 2)
      );
    });
  });
}

module.exports = {
  devtool: isDevelopment && 'source-map',
  entry: {
    app: entry,
  },
  output: {
    path: path.resolve('../../build/assets'),
    filename: isDevelopment ? 'bundle.js' : '[name]-[chunkhash].js',
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
    disableHostCheck: true,
  },

  stats: {
    children: false,
  },
};
