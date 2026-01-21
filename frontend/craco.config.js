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
      
      webpackConfig.plugins = webpackConfig.plugins || [];
      
      // Add a custom plugin that intercepts module resolution before ModuleScopePlugin
      // This converts absolute paths to process/browser.js to use the package name
      const processBrowserPath = require.resolve('process/browser');
      const processInterceptorPlugin = {
        apply: (compiler) => {
          compiler.hooks.normalModuleFactory.tap('ProcessBrowserInterceptor', (nmf) => {
            nmf.hooks.beforeResolve.tap('ProcessBrowserInterceptor', (data) => {
              if (data && data.request) {
                // Check if the request is an absolute path to process/browser.js
                if (data.request.includes('process/browser.js') || 
                    data.request.includes('process/browser')) {
                  // Replace with package name to avoid absolute path issues
                  if (data.request.includes('/node_modules/process/browser.js') ||
                      data.request.endsWith('/process/browser.js')) {
                    data.request = 'process/browser';
                  }
                }
              }
            });
          });
        }
      };
      webpackConfig.plugins.unshift(processInterceptorPlugin);
      
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
      
      // Modify ModuleScopePlugin to allow process/browser if it exists
      const moduleScopePluginIndex = webpackConfig.plugins.findIndex(
        plugin => {
          return plugin.constructor && (
            plugin.constructor.name === 'ModuleScopePlugin' ||
            (plugin.appSrcs && Array.isArray(plugin.appSrcs))
          );
        }
      );
      
      if (moduleScopePluginIndex !== -1) {
        const originalPlugin = webpackConfig.plugins[moduleScopePluginIndex];
        const processDir = path.dirname(processBrowserPath);
        
        // Patch the plugin's apply method to allow process/browser
        const originalApply = originalPlugin.apply.bind(originalPlugin);
        originalPlugin.apply = function(compiler) {
          // Add process directory to allowed sources
          if (this.appSrcs && Array.isArray(this.appSrcs)) {
            if (!this.appSrcs.includes(processDir)) {
              this.appSrcs = [...this.appSrcs, processDir];
            }
          }
          originalApply(compiler);
        };
      }
      
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