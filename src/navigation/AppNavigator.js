import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MessageScreen from '../screens/MessageScreen';
import AppliedJobsScreen from '../screens/AppliedJobsScreen';
import RecruiterProfile from '../screens/RecruiterProfile';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'ScoutJar Talent' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Messages" component={MessageScreen} />
        <Stack.Screen name="AppliedJobs" component={AppliedJobsScreen} options={{ title: 'My Applications' }} />
        <Stack.Screen name="RecruiterProfile" component={RecruiterProfile} options={{ title: 'Recruiter Info' }} />
        <Stack.Screen name="MessageScreen" component={MessageScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
