import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { commonStyles } from './theme';
import { EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL, EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_PORT } from '@env';
import { EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL, EXPO_PUBLIC_SCOUTJAR_AI_BASE_PORT } from '@env';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const baseUrl = `${EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL}` //${EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_PORT}`;
  const AIbaseUrl = `${EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL}` //${EXPO_PUBLIC_SCOUTJAR_AI_BASE_PORT}`; 

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    console.log(`${baseUrl}/login-talent`)
    try {
      //const response = await fetch(`${baseUrl}/login-talent`, {
      const response = await fetch(`${baseUrl}/login-talent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('talent', JSON.stringify(data.talent));

      console.log("🟢 Login successful", data);
      navigation.replace("Home", { user: data.user, talent: data.talent });
    } catch (err) {
      console.error("❌ Login error:", err);
      Alert.alert("Login Failed", err.message);
    }
  };

  return (
    <View style={[commonStyles.container, { justifyContent: 'center' }]}>
      <Text style={commonStyles.title}>ScoutJar Talent Login</Text>

      <TextInput
        style={commonStyles.input}
        placeholder="Email"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={commonStyles.input}
        placeholder="Password"
        placeholderTextColor="#ccc"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={commonStyles.button} onPress={handleLogin}>
        <Text style={commonStyles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}
