const webpack = require('webpack');
const path = require('path');

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
      
      // Ensure aliases are set up correctly - use package name, not absolute path
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@toruslabs/eccrypto': false,
        'process/browser': require.resolve('process/browser'),
        'process/browser.js': require.resolve('process/browser'),
        'process': require.resolve('process/browser'),
      };
      
      // Remove CRA's ModuleScopePlugin from resolve.plugins
      // This is the correct location where ModuleScopePlugin is registered
      if (webpackConfig.resolve && Array.isArray(webpackConfig.resolve.plugins)) {
        webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
          (plugin) => !(plugin && plugin.constructor && plugin.constructor.name === 'ModuleScopePlugin')
        );
      }
      
      // Also check in the main plugins array (some versions might put it there)
      webpackConfig.plugins = webpackConfig.plugins || [];
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => {
          if (!plugin || !plugin.constructor) return true;
          return plugin.constructor.name !== 'ModuleScopePlugin' &&
                 !(plugin.appSrcs && Array.isArray(plugin.appSrcs));
        }
      );
      
      // Use NormalModuleReplacementPlugin to intercept absolute path imports
      // This catches any imports that use absolute paths to process/browser.js
      const processBrowserPathResolved = require.resolve('process/browser');
      webpackConfig.plugins.unshift(
        new webpack.NormalModuleReplacementPlugin(
          /^\/.*\/node_modules\/process\/browser\.js$/,
          processBrowserPathResolved
        )
      );
      
      // Also catch relative paths that might resolve to absolute paths
      webpackConfig.plugins.unshift(
        new webpack.NormalModuleReplacementPlugin(
          /process\/browser\.js$/,
          processBrowserPathResolved
        )
      );
      
      // Remove any existing ProvidePlugin to avoid conflicts
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => !(plugin instanceof webpack.ProvidePlugin)
      );
      
      // Add ProvidePlugin with process and Buffer polyfills
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
      
      return webpackConfig;
    },
  },
}; 