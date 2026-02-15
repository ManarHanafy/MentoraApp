/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
/*import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme';

export default function App(): React.ReactElement {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}*/


import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme';

function App() {
  

  return (
    <SafeAreaProvider>
      <AuthProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
  
}

/*function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});*/

export default App;
/*import React from 'react';
const isDarkMode = useColorScheme() === 'dark';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme';

export default function App(): React.ReactElement {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <AppNavigator />
      <AppContent />
    </SafeAreaProvider>
  );
}
  <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />*/
