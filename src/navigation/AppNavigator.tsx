import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { colors, typography } from '../theme';
import { styles } from './AppNavigator.style';
import { useAuth } from '../context/AuthContext';
import {
  LoginScreen,
  SignUpScreen,
  OnboardingScreen,
  HomeScreen,
  BreathingExerciseScreen,
  MoodCheckInScreen,
  ChatScreen,
  JournalScreen,
  DashboardScreen,
  ProfileScreen,
  SettingsScreen,
  EditProfileScreen,
  ExercisesListScreen,
} from '../screens';
import { HomeIcon, ChatIcon, JournalIcon, InsightsIcon, ProfileIcon } from '../components/Icons';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ProfileStack(): React.ReactElement {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}



function MainTabs(): React.ReactElement {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: -5,
          marginBottom: 5,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <HomeIcon focused={focused} color={color} size={24} />,
          tabBarLabel: 'Home'
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <ChatIcon focused={focused} color={color} size={24} />,
          tabBarLabel: 'Chat'
        }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <JournalIcon focused={focused} color={color} size={24} />,
          tabBarLabel: 'Journal'
        }}
      />
      <Tab.Screen
        name="Insights"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <InsightsIcon focused={focused} color={color} size={24} />,
          tabBarLabel: 'Insights'
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ focused, color }) => <ProfileIcon focused={focused} color={color} size={24} />,
          tabBarLabel: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack(): React.ReactElement {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen name="Login">
        {({ navigation }) => <LoginScreen onGoToSignUp={() => navigation.navigate('SignUp' as never)} />}
      </Stack.Screen>
      <Stack.Screen name="SignUp">
        {({ navigation }) => <SignUpScreen onGoToLogin={() => navigation.goBack()} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export function AppNavigator(): React.ReactElement {
  const { isLoading, isLoggedIn, hasCompletedOnboarding } = useAuth();

  let content: React.ReactNode;
  if (isLoading) {
    content = (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[typography.body, { color: colors.textMuted }]}>Loading...</Text>
      </View>
    );
  } else if (!isLoggedIn) {
    content = <AuthStack />;
  } else if (!hasCompletedOnboarding) {
    content = <OnboardingScreen onComplete={() => { }} />;
  } else {
    content = (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="BreathingExercise" component={BreathingExerciseScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MoodCheckIn" component={MoodCheckInScreen} options={{ title: 'Mood check-in' }} />
        <Stack.Screen name="ExercisesList" component={ExercisesListScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  return <NavigationContainer>{content}</NavigationContainer>;
}

export default AppNavigator;