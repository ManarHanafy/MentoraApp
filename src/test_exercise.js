const Module = require('module');
const originalRequire = Module.prototype.require;

const mockStorage = {
  store: {
    '@suggested_exercises': JSON.stringify([
      {
        id: '1',
        name: 'Old CBT Exercise',
        exerciseCode: 'CBT_Old',
        suggestedAt: Date.now() - 100000
      }
    ])
  },
  getItem: async (key) => mockStorage.store[key] || null,
  setItem: async (key, val) => { mockStorage.store[key] = val; },
  removeItem: async (key) => { delete mockStorage.store[key]; }
};

Module.prototype.require = function (id) {
  if (id === '@react-native-async-storage/async-storage') {
    return { default: mockStorage, __esModule: true };
  }
  if (id === '../config/env' || id === './config/env') {
    return { API_BASE_URL: 'http://localhost' };
  }
  if (id === './authHelper') {
    return { getOrRefreshToken: async () => 'mock-token' };
  }
  if (id.includes('ex_cdt_eng_safe.json') || id.includes('ex_dep_anx.json') || id.includes('ex_str_slp_soc.json')) {
    try {
      return originalRequire.apply(this, arguments);
    } catch {
      return []; // Return empty array if require fails
    }
  }
  return originalRequire.apply(this, arguments);
};

const { ExerciseService } = require('../temp_compiled/services/exerciseService');

async function runTest() {
  console.log('--- Initial Suggestions ---');
  console.log(await ExerciseService.getSuggestedExercises());

  // Test saving suggestions (mix of strings, code, and object duplicates)
  console.log('\n--- Saving new suggestions ---');
  await ExerciseService.saveSuggestedExercises([
    'Thought_Record_Basics', // in local map
    'Some_New_Unknown_Exercise',
    {
      id: 15,
      name: 'Old CBT Exercise', // Duplicate name of the old one in storage!
      exerciseCode: 'CBT_Old'
    }
  ]);

  console.log('\n--- Suggestions after save ---');
  const result = await ExerciseService.getSuggestedExercises();
  console.log(JSON.stringify(result, null, 2));
  console.log('Count:', result.length);
}

runTest().catch(console.error);
