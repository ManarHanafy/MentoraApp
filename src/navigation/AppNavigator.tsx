import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { colors, typography } from '../theme';
import { styles } from './AppNavigator.style';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LoginScreen,
  SignUpScreen,
  OnboardingScreen,
  HomeScreen,
  MoodCheckInScreen,
  ChatScreen,
  JournalScreen,
  DashboardScreen,
  ProfileScreen,
  SettingsScreen,
  EditProfileScreen,
  ExercisesScreen,
  LanguageScreen,
  HelpCenterScreen,
  PrivacyPolicyScreen,
  NotificationSettingsScreen,
  ChangePasswordScreen,
  DeleteAccountScreen,
} from '../screens';
import { HomeIcon, ChatIcon, JournalIcon, InsightsIcon, ProfileIcon } from '../components/Icons';
import { SwipeContainer } from '../components';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ProfileStack(): React.ReactElement {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
    </Stack.Navigator>
  );
}

const SwipeHome = (props: any) => <SwipeContainer><HomeScreen {...props} /></SwipeContainer>;
const SwipeChat = (props: any) => <SwipeContainer><ChatScreen {...props} /></SwipeContainer>;
const SwipeJournal = (props: any) => <SwipeContainer><JournalScreen {...props} /></SwipeContainer>;
const SwipeInsights = (props: any) => <SwipeContainer><DashboardScreen {...props} /></SwipeContainer>;
const SwipeProfile = (props: any) => <SwipeContainer><ProfileStack {...props} /></SwipeContainer>;

function MainTabs(): React.ReactElement {
  const { t } = useLanguage();
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
        component={SwipeHome}
        options={{
          tabBarIcon: ({ focused, color }) => <HomeIcon focused={focused} color={color} size={24} />,
          tabBarLabel: t.tabs.home
        }}
      />
      <Tab.Screen
        name="Chat"
        component={SwipeChat}
        options={{
          tabBarIcon: ({ focused, color }) => <ChatIcon focused={focused} color={color} size={24} />,
          tabBarLabel: t.tabs.chat
        }}
      />
      <Tab.Screen
        name="Journal"
        component={SwipeJournal}
        options={{
          tabBarIcon: ({ focused, color }) => <JournalIcon focused={focused} color={color} size={24} />,
          tabBarLabel: t.tabs.journal
        }}
      />
      <Tab.Screen
        name="Insights"
        component={SwipeInsights}
        options={{
          tabBarIcon: ({ focused, color }) => <InsightsIcon focused={focused} color={color} size={24} />,
          tabBarLabel: t.tabs.insights
        }}
      />
      <Tab.Screen
        name="Profile"
        component={SwipeProfile}
        options={{
          tabBarIcon: ({ focused, color }) => <ProfileIcon focused={focused} color={color} size={24} />,
          tabBarLabel: t.tabs.profile
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
        <Stack.Screen name="Exercises" component={ExercisesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MoodCheckIn" component={MoodCheckInScreen} options={{ title: 'Mood check-in' }} />
      </Stack.Navigator>
    );
  }

  return <NavigationContainer>{content}</NavigationContainer>;
}

export default AppNavigator;