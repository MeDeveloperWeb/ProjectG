// Global polyfills for React Native development build
console.log('Loading global polyfills...');

// Ensure global is defined and available
if (typeof global === 'undefined') {
  global = globalThis;
}

// Ensure globalThis is properly set
if (typeof globalThis === 'undefined') {
  globalThis = global;
}

// React Native development build requirements
try {
  // Import essential polyfills
  require('react-native-get-random-values');
  require('react-native-url-polyfill/auto');
  
  // Buffer polyfill
  if (!global.Buffer) {
    global.Buffer = require('buffer').Buffer;
  }

  // Console polyfill
  if (typeof console === 'undefined') {
    global.console = {
      log: () => {},
      warn: () => {},
      error: () => {},
      info: () => {},
      debug: () => {},
      trace: () => {},
      group: () => {},
      groupEnd: () => {},
      time: () => {},
      timeEnd: () => {},
    };
  }

  // Process polyfill for Node.js compatibility
  if (typeof process === 'undefined') {
    global.process = {
      env: { NODE_ENV: 'development' },
      platform: 'react-native',
      version: '1.0.0',
      nextTick: (fn) => setTimeout(fn, 0),
    };
  }

  // Crypto polyfill
  if (!global.crypto) {
    global.crypto = require('react-native-crypto');
  }

  console.log('Global polyfills loaded successfully');
} catch (error) {
  console.warn('Error loading polyfills:', error);
}
