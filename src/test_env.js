const mockAsyncStorage = {
  store: {},
  getItem: async (key) => mockAsyncStorage.store[key] || null,
  setItem: async (key, val) => { mockAsyncStorage.store[key] = val; },
  removeItem: async (key) => { delete mockAsyncStorage.store[key]; }
};

// Mock AsyncStorage global before requiring services
jest = { mock: () => {} };
require('react-native-custom-mock-storage-if-any'); // dummy
