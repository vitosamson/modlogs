const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  webpack: (config, { webpack }) => {
    // only include en-gb moment.js locale
    // TODO: replace moment with date-fns
    config.plugins.push(
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en-gb/)
    );

    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.HOST': JSON.stringify(
          process.env.HOST || 'localhost:3000'
        ),
      })
    );

    return config;
  },
});
