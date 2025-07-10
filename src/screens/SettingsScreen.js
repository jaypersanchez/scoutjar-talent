import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL,
  EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL,
} from '@env';
import { MaterialIcons } from '@expo/vector-icons';

// import your TermsAndConditions
import TermsAndConditions from './TermsAndConditions';

export default function SettingsScreen({ navigation }) {
  const baseUrl = EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL;
  const serverBaseUrl = EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL;

  const [talentId, setTalentId] = useState(null);
  const [section, setSection] = useState('passive');

  const [prefs, setPrefs] = useState({
    salary_min: '',
    salary_max: '',
    dream_companies: '',
    match_threshold: '80',
    remote_preference: true,
    preferred_industries: '',
    preferred_roles: '',
    preferred_currency: 'USD',
  });

  const currencySymbols = {
    USD: '$',
    EUR: '€',
    ILS: '₪',
    GBP: '£',
    AUD: 'A$',
    CAD: 'C$' // Canadian Dollar (Loonie)
  };

 console.log('📦 Currency:', prefs.preferred_currency);

  useEffect(() => {
    const loadModeAndData = async () => {
      const talentStr = await AsyncStorage.getItem('talent');
      const talent = JSON.parse(talentStr || '{}');
      if (talent?.talent_id) {
        setTalentId(talent.talent_id);
        loadPreferences(talent.talent_id);
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
          preferred_currency: d.preferred_currency || 'USD',
        });
      }
    } catch (e) {
      console.error('❌ Failed to load passive preferences:', e);
    }
  };

  const handleChange = (key, value) =>
    setPrefs((prev) => ({ ...prev, [key]: value }));

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
      preferred_currency: prefs.preferred_currency || 'USD'
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
      {/* Section Switcher */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginVertical: 10,
          flexWrap: 'wrap',
        }}
      >
        <TouchableOpacity
          onPress={() => setSection('passive')}
          style={{
            marginHorizontal: 10,
            padding: 6,
            borderBottomWidth: section === 'passive' ? 2 : 0,
            borderColor: '#007bff',
          }}
        >
          <Text style={{ color: section === 'passive' ? '#007bff' : '#333' }}>
            Passive Preferences
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSection('password')}
          style={{
            marginHorizontal: 10,
            padding: 6,
            borderBottomWidth: section === 'password' ? 2 : 0,
            borderColor: '#007bff',
          }}
        >
          <Text style={{ color: section === 'password' ? '#007bff' : '#333' }}>
            Change Password
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSection('terms')}
          style={{
            marginHorizontal: 10,
            padding: 6,
            borderBottomWidth: section === 'terms' ? 2 : 0,
            borderColor: '#007bff',
          }}
        >
          <Text style={{ color: section === 'terms' ? '#007bff' : '#333' }}>
            Terms & Conditions
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {section === 'passive' && (
          <>
            {renderInput('Dream Companies (comma separated)', 'dream_companies', prefs, handleChange)}
            {renderInput('Preferred Industries (comma separated)', 'preferred_industries', prefs, handleChange)}
            {renderInput('Preferred Roles (comma separated)', 'preferred_roles', prefs, handleChange)}
            {/*renderInput('Min Salary', 'salary_min', prefs, handleChange, 'numeric')*/}
            <View style={{ marginTop: 14, width: '90%' }}>
              <Text style={styles.label}>Min Salary</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, marginRight: 6 }}>
                  {currencySymbols[prefs.preferred_currency] || ''}
                </Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={prefs.salary_min}
                  onChangeText={(text) => handleChange('salary_min', text)}
                  keyboardType="numeric"
                />
              </View>
            </View>
            {/*<Picker
              selectedValue={prefs.preferred_currency}
              onValueChange={(val) => handleChange('preferred_currency', val)}
              
            >
              <Picker.Item label="Select a currency..." value="USD" />
              <Picker.Item label="USD U.S. Dollar" value="USD" />
              <Picker.Item label="EUR Euro" value="EUR" />
              <Picker.Item label="ILS Euro" value="ILS" />
              <Picker.Item label="GBP British Pound" value="GBP" />
              <Picker.Item label="AUD Australian Dollar" value="AUD" />
              <Picker.Item label="CAD Canadian Dollar" value="CAD" />
            </Picker>*/}
            <Text style={styles.label}>Preferred Currency</Text>
<View style={{ width: '100%', marginBottom: 12 }}>
  {Object.entries(currencySymbols).map(([code, symbol]) => (
    <TouchableOpacity
      key={code}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: prefs.preferred_currency === code ? '#e6f0ff' : '#fff',
        borderWidth: 1,
        borderColor: prefs.preferred_currency === code ? '#007bff' : '#ccc',
        borderRadius: 8,
        marginVertical: 4,
      }}
      onPress={() => handleChange('preferred_currency', code)}
    >
      <View
        style={{
          height: 20,
          width: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: '#007bff',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        {prefs.preferred_currency === code && (
          <View
            style={{
              height: 10,
              width: 10,
              borderRadius: 5,
              backgroundColor: '#007bff',
            }}
          />
        )}
      </View>
      <Text style={{ color: '#333' }}>{code} – {symbol}</Text>
    </TouchableOpacity>
  ))}
</View>

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

        {section === 'password' && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.label}>Change Password</Text>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() =>
                Alert.alert('Coming Soon', 'Password change coming soon!')
              }
            >
              <Text style={styles.saveButtonText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        )}

        {section === 'terms' && (
          <View style={{ width: '90%', marginTop: 20 }}>
            <TermsAndConditions />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerIconButton}
          onPress={() => navigation.navigate('Home')}
        >
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
    padding: 20,
    paddingBottom: 100,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
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
  picker: {
    marginTop: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },

});
