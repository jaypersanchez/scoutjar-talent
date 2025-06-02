// SettingsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL, EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL } from '@env';
import { MaterialIcons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  const baseUrl = EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL;
  const serverBaseUrl = EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL;

  const [isActive, setIsActive] = useState(true);
  const [talentId, setTalentId] = useState(null);
  const [prefs, setPrefs] = useState({
    salary_min: '',
    salary_max: '',
    dream_companies: '',
    match_threshold: '80',
    remote_preference: true,
    preferred_industries: '',
    preferred_roles: '',
  });

  useEffect(() => {
    const loadModeAndData = async () => {
      const mode = await AsyncStorage.getItem('profile_mode');
      setIsActive(mode !== 'passive');
      const talentStr = await AsyncStorage.getItem('talent');
      const talent = JSON.parse(talentStr || '{}');
      if (talent?.talent_id) {
        setTalentId(talent.talent_id);
        if (mode === 'passive') loadPreferences(talent.talent_id);
      }
    };
    loadModeAndData();
  }, []);

  const loadPreferences = async (talent_id) => {
    try {
      const response = await fetch(`${baseUrl}/get-passive-preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ talent_id }),
      });
      const result = await response.json();
      if (result?.data) {
        const d = result.data;
        setPrefs({
          salary_min: d.salary_min?.toString() || '',
          salary_max: d.salary_max?.toString() || '',
          dream_companies: (d.dream_companies || []).join(', '),
          match_threshold: d.match_threshold?.toString() || '80',
          remote_preference: d.remote_preference,
          preferred_industries: (d.preferred_industries || []).join(', '),
          preferred_roles: (d.preferred_roles || []).join(', '),
        });
      }
    } catch (e) {
      console.error('❌ Failed to load passive preferences:', e);
    }
  };

  const toggleMode = async (value) => {
    const mode = value ? 'active' : 'passive';
    setIsActive(value);
    await AsyncStorage.setItem('profile_mode', mode);

    if (!talentId) return;

    try {
      const endpoint = `${serverBaseUrl}/talent-profiles/update-profile-mode`;
      const payload = { talent_id: talentId, profile_mode: mode };
      console.log('🌐 Sending profile_mode update to:', endpoint);
      console.log('📦 Payload:', payload);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await response.text();

      try {
        const json = JSON.parse(text);

        if (!response.ok) {
          console.error('❌ Server returned error:', json);
          Alert.alert('Failed to update profile mode', json.error || 'Unknown error');
          return;
        }

        console.log('✅ Mode update success:', json);

        const talentStr = await AsyncStorage.getItem('talent');
        const parsedTalent = JSON.parse(talentStr || '{}');
        parsedTalent.profile_mode = mode;
        await AsyncStorage.setItem('talent', JSON.stringify(parsedTalent));
      } catch (jsonErr) {
        console.error('🔥 Failed to parse server response:', text);
        Alert.alert('Server Error', 'Unexpected server response.');
      }
    } catch (err) {
      console.error('❌ Network or server error while updating profile_mode:', err);
      Alert.alert('❌ Error', 'Could not update profile mode. Please try again.');
    }

    if (!value) await loadPreferences(talentId);

    navigation.navigate('Home');
  };

  const handleChange = (key, value) => setPrefs((prev) => ({ ...prev, [key]: value }));

  const savePreferences = async () => {
    if (!talentId) {
      Alert.alert('Missing talent ID');
      return;
    }

    const payload = {
      talent_id: talentId,
      salary_min: parseFloat(prefs.salary_min || 0),
      salary_max: parseFloat(prefs.salary_max || 0),
      dream_companies: prefs.dream_companies.split(',').map((s) => s.trim()),
      match_threshold: parseInt(prefs.match_threshold || '80'),
      remote_preference: prefs.remote_preference,
      preferred_industries: prefs.preferred_industries.split(',').map((s) => s.trim()),
      preferred_roles: prefs.preferred_roles.split(',').map((s) => s.trim()),
    };

    try {
      const res = await fetch(`${baseUrl}/save-passive-preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        Alert.alert('❌ Error', result.error || 'Failed to save preferences.');
      } else {
        Alert.alert('✅ Saved', 'Passive preferences updated.');
      }
    } catch (err) {
      console.error('❌ Failed to save preferences:', err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Profile Mode: {isActive ? 'Active' : 'Passive'}</Text>
        <Switch
          value={isActive}
          onValueChange={toggleMode}
          thumbColor={isActive ? '#4CAF50' : '#ccc'}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />

        {!isActive && (
          <>
            {renderInput('Dream Companies (comma separated)', 'dream_companies', prefs, handleChange)}
            {renderInput('Preferred Industries (comma separated)', 'preferred_industries', prefs, handleChange)}
            {renderInput('Preferred Roles (comma separated)', 'preferred_roles', prefs, handleChange)}
            {renderInput('Min Salary', 'salary_min', prefs, handleChange, 'numeric')}
            {renderInput('Match Threshold (%)', 'match_threshold', prefs, handleChange, 'numeric')}

            <Text style={styles.label}>Open to Remote Work?</Text>
            <Switch
              value={prefs.remote_preference}
              onValueChange={(val) => handleChange('remote_preference', val)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
            />

            <TouchableOpacity style={styles.saveButton} onPress={savePreferences}>
              <Text style={styles.saveButtonText}>💾 Save Preferences</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerIconButton} onPress={() => navigation.navigate('Home')}>
          <MaterialIcons name="home" size={26} color="#7D4AEA" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const renderInput = (label, key, state, handleChange, keyboardType = 'default') => (
  <View style={{ marginTop: 14, width: '90%' }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={state[key]}
      onChangeText={(text) => handleChange(key, text)}
      keyboardType={keyboardType}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20, paddingBottom: 100, alignItems: 'center', backgroundColor: '#fff',
  },
  label: {
    fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 6,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  footerIconButton: {
    backgroundColor: '#f0f0f5',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
