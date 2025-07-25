const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure TypeScript and JSX files are properly resolved
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

// Enable proper JSX transformation
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

// Add resolver aliases for better compatibility
config.resolver.alias = {
  ...config.resolver.alias,
  'crypto': 'react-native-crypto',
  'stream': 'stream-browserify',
  'buffer': 'buffer',
};

// Ensure global polyfills are available
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

module.exports = config;
