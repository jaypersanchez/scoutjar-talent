import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from '../firebase/firebaseConfig';
import { EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL } from '@env';

initializeApp(firebaseConfig);
const auth = getAuth();

export default function TalentSSOLogin({ navigation }) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then(async (result) => {
          const user = result.user;

          const payload = {
            email: user.email,
            full_name: user.displayName,
            profile_picture: user.photoURL,
            oauth_provider: 'google',
            oauth_provider_id: user.uid,
          };

          const res = await fetch(`${EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL}/social-login-talent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const data = await res.json();

          if (!res.ok) throw new Error(data.error || "Login failed");

          await AsyncStorage.setItem('user', JSON.stringify(data.user));
          await AsyncStorage.setItem('talent', JSON.stringify(data.talent));

          navigation.replace("Home", { user: data.user, talent: data.talent });
        })
        .catch((err) => {
          console.error("❌ SSO login error:", err);
          Alert.alert("Login Failed", err.message);
        });
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/lookk.png')} style={{ width: 180, height: 50, resizeMode: 'contain', marginBottom: 30 }} />
      <Text style={styles.title}>Sign in with Google</Text>
      <TouchableOpacity style={styles.button} onPress={() => promptAsync()}>
        <Text style={styles.buttonText}>🔐 Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2727D9', marginBottom: 24 },
  button: { backgroundColor: '#7D4AEA', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 50, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
