import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MessageScreen from '../screens/MessageScreen';
import AppliedJobsScreen from '../screens/AppliedJobsScreen';
import RecruiterProfile from '../screens/RecruiterProfile';
import SettingsScreen from '../screens/SettingsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
  Animated,
  Easing,
  ScrollView
} from 'react-native';

import ProfileStep1 from '../screens/profilewizard/ProfileStep1';
import ProfileStep2 from '../screens/profilewizard/ProfileStep2';
import ProfileStep3 from '../screens/profilewizard/ProfileStep3';
import ProfileStep4 from '../screens/profilewizard/ProfileStep4';
import ProfileStep5 from '../screens/profilewizard/ProfileStep5';
import ProfileStep6 from '../screens/profilewizard/ProfileStep6';
import ProfileStep7 from '../screens/profilewizard/ProfileStep7';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {

  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
  const checkLogin = async () => {
    console.log('[App Start] Checking AsyncStorage...');

    const start = Date.now();

    try {
      const userStr = await AsyncStorage.getItem('user');
      console.log('[App Start] Got user from AsyncStorage:', userStr);

      const duration = Date.now() - start;
      console.log(`[App Start] Login check took ${duration} ms`);

      setInitialRoute(userStr ? 'Home' : 'Login');
    } catch (err) {
      console.error('[App Start] Error during login check:', err);
      setInitialRoute('Login'); // fallback
    }
  };

  checkLogin();
}, []);


  if (!initialRoute) {
  console.log('[AppNavigator] Waiting for login check...');
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#7D4AEA" />
    </View>
  );
}


  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'LooKK' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Messages" component={MessageScreen} />
        <Stack.Screen name="AppliedJobs" component={AppliedJobsScreen} options={{ title: 'My Applications' }} />
        <Stack.Screen name="RecruiterProfile" component={RecruiterProfile} options={{ title: 'Recruiter Info' }} />
        <Stack.Screen name="MessageScreen" component={MessageScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />

        {/* Profile Wizard Steps */}
        <Stack.Screen name="ProfileStep1" component={ProfileStep1} options={{ headerShown: false }} />
        <Stack.Screen name="ProfileStep2" component={ProfileStep2} options={{ headerShown: false }} />
        <Stack.Screen name="ProfileStep3" component={ProfileStep3} options={{ headerShown: false }} />
        <Stack.Screen name="ProfileStep4" component={ProfileStep4} options={{ headerShown: false }} />
        <Stack.Screen name="ProfileStep5" component={ProfileStep5} options={{ headerShown: false }} />
        <Stack.Screen name="ProfileStep6" component={ProfileStep6} options={{ headerShown: false }} />
        <Stack.Screen name="ProfileStep7" component={ProfileStep7} options={{ headerShown: false }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
