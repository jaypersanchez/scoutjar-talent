import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const loadMode = async () => {
      const mode = await AsyncStorage.getItem('profile_mode');
      if (mode !== null) {
        setIsActive(mode === 'active');
      }
    };
    loadMode();
  }, []);

  const toggleMode = async (value) => {
    setIsActive(value);
    await AsyncStorage.setItem('profile_mode', value ? 'active' : 'passive');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Profile Mode: {isActive ? 'Active' : 'Passive'}</Text>
      <Switch
        value={isActive}
        onValueChange={toggleMode}
        thumbColor={isActive ? '#4CAF50' : '#ccc'}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
  },
  label: {
    fontSize: 18, marginBottom: 12, color: '#333',
  },
});
