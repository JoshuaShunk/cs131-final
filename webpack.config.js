module.exports = {
  // This file is used by react-scripts to extend the webpack configuration
  // It will be automatically picked up by react-scripts
  resolve: {
    fallback: {
      // Add any polyfills if needed
    }
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false, // Disable the requirement for extension in import
        },
      },
    ],
  },
  ignoreWarnings: [
    // Ignore warnings from source-map-loader
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
  ],
}; 