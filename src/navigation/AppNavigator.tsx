import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { colors, typography } from '../theme';
import { styles } from './AppNavigator.style';
import { useAuth } from '../context/AuthContext';
import {
  HomeScreen,
  BreathingExerciseScreen,
  MoodCheckInScreen,
  ChatScreen,
  JournalScreen,
  DashboardScreen,
  ProfileScreen,
} from '../screens';
import { HomeIcon, ChatIcon, JournalIcon, InsightsIcon, ProfileIcon } from '../components/Icons';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();



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
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <ProfileIcon focused={focused} color={color} size={24} />,
          tabBarLabel: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator(): React.ReactElement {
  const { isLoading } = useAuth();

  let content: React.ReactNode;
  if (isLoading) {
    content = (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[typography.body, { color: colors.textMuted }]}>Loading...</Text>
      </View>
    );
  } else {
    content = (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="BreathingExercise" component={BreathingExerciseScreen} options={{ title: 'Breathing Exercise' }} />
        <Stack.Screen name="MoodCheckIn" component={MoodCheckInScreen} options={{ title: 'Mood check-in' }} />
      </Stack.Navigator>
    );
  }

  return <NavigationContainer>{content}</NavigationContainer>;
}

export default AppNavigator;