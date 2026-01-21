const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer"),
        "util": require.resolve("util"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "url": require.resolve("url"),
        "path": require.resolve("path-browserify"),
        "fs": false,
        "net": false,
        "tls": false,
        "process": require.resolve("process/browser"),
      };
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@toruslabs/eccrypto': false,
        'process/browser': require.resolve('process/browser'),
        'process': require.resolve('process/browser'),
      };
      
      // Ensure plugins array exists and add ProvidePlugin if not already present
      webpackConfig.plugins = webpackConfig.plugins || [];
      
      // Check if ProvidePlugin already exists, if not add it
      const hasProvidePlugin = webpackConfig.plugins.some(
        plugin => plugin instanceof webpack.ProvidePlugin
      );
      
      if (!hasProvidePlugin) {
        webpackConfig.plugins.push(
          new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
          })
        );
      } else {
        // Update existing ProvidePlugin to ensure process is included
        const providePlugin = webpackConfig.plugins.find(
          plugin => plugin instanceof webpack.ProvidePlugin
        );
        if (providePlugin && !providePlugin.definitions.process) {
          providePlugin.definitions.process = 'process/browser';
        }
      }
      
      return webpackConfig;
    },
  },
}; 