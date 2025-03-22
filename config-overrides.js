const path = require('path');

module.exports = function override(config, env) {
  // Ignore source map warnings for specific modules
  config.ignoreWarnings = [
    ...(config.ignoreWarnings || []),
    {
      module: /node_modules\/@mediapipe\/tasks-vision\/vision_bundle\.mjs/,
    },
    function ignoreSourceMapLoaderWarnings(warning) {
      return (
        warning.module &&
        warning.module.resource &&
        (warning.module.resource.includes('@mediapipe/tasks-vision') ||
          warning.message.includes('Failed to parse source map'))
      );
    },
  ];

  // Disable source maps for node_modules
  if (config.module && config.module.rules) {
    config.module.rules.forEach(rule => {
      if (rule.use && Array.isArray(rule.use)) {
        rule.use.forEach(loader => {
          if (loader.loader && loader.loader.includes('source-map-loader')) {
            loader.exclude = /node_modules/;
          }
        });
      }
    });
  }

  return config;
}; 