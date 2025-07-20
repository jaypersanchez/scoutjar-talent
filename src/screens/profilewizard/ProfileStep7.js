// screens/profilewizard/ProfileStep7.js
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

export default function ProfileStep7({ navigation }) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace('Home');
    }, 2000); // Wait 2 seconds before redirecting

    return () => clearTimeout(timeout); // Cleanup
  }, [navigation]);

  return (
    <View style={{ padding: 20, justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 16 }}>Your Profile is Ready!</Text>
      <Text style={{ fontSize: 16, textAlign: 'center' }}>
        Redirecting to your home screen...
      </Text>
    </View>
  );
}
