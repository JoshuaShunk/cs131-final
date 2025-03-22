module.exports = {
  extends: ['react-app'],
  ignorePatterns: ['node_modules/**/*'],
  rules: {
    // Disable source-map-loader warnings
    'import/no-webpack-loader-syntax': 'off',
  },
  overrides: [
    {
      files: ['node_modules/**/*.js', 'node_modules/**/*.mjs'],
      rules: {
        // Disable all rules for node_modules
        'no-unused-vars': 'off',
        'no-undef': 'off',
        'import/no-webpack-loader-syntax': 'off',
      },
    },
  ],
}; 