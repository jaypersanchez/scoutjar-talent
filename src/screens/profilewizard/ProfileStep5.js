// screens/profilewizard/ProfileStep5.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, Button, Alert, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';


export default function ProfileStep5({ navigation }) {
  const [dreamCompany, setDreamCompany] = useState('');
  const [preferredIndustry, setPreferredIndustry] = useState('');
  const [matchThreshold, setMatchThreshold] = useState('');
  const [passiveMode, setPassiveMode] = useState(false);
  const [talentId, setTalentId] = useState(null);
  const [desiredCurrency, setDesiredCurrency] = useState('USD');
const [desiredSalary, setDesiredSalary] = useState('');


  const currencySymbols = {
  USD: '$',
  EUR: '€',
  ILS: '₪',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$'
};


  useEffect(() => {
    AsyncStorage.getItem('talent').then((t) => {
      if (t) {
        const profile = JSON.parse(t);
        setDreamCompany(profile.dream_company || '');
        setPreferredIndustry(profile.preferred_industry || '');
        setMatchThreshold(profile.match_threshold?.toString() || '');
        setPassiveMode(profile.profile_mode === 'passive');
        setTalentId(profile.talent_id);
      }
    });
  }, []);

  const handleNext = async () => {
    const payload = {
      dream_company: dreamCompany,
      preferred_industry: preferredIndustry,
      match_threshold: parseFloat(matchThreshold),
      profile_mode: passiveMode ? 'passive' : 'active',
      desired_salary: parseFloat(desiredSalary),
      desired_currency: desiredCurrency
    };


    try {
      const existingDraft = await AsyncStorage.getItem('onboardingDraft');
      const draft = existingDraft ? JSON.parse(existingDraft) : {};
      const updatedDraft = { ...draft, ...payload };
      await AsyncStorage.setItem('onboardingDraft', JSON.stringify(updatedDraft));
      navigation.replace('ProfileStep6');
    } catch (err) {
      Alert.alert('Error', 'Failed to update your profile.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Refine your match preferences</Text>

      <TextInput
        placeholder="Dream company"
        value={dreamCompany}
        onChangeText={setDreamCompany}
        style={styles.input}
      />

      <TextInput
        placeholder="Preferred industry"
        value={preferredIndustry}
        onChangeText={setPreferredIndustry}
        style={styles.input}
      />

      <TextInput
        placeholder="Match threshold (e.g. 70)"
        value={matchThreshold}
        onChangeText={setMatchThreshold}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Desired salary</Text>
      <View style={styles.salaryContainer}>
        <Text style={styles.currencySymbol}>{currencySymbols[desiredCurrency] || ''}</Text>
        <TextInput
          placeholder="Amount"
          value={desiredSalary}
          onChangeText={setDesiredSalary}
          keyboardType="numeric"
          style={styles.salaryInput}
        />
      </View>

      <Text style={styles.label}>Currency</Text>
      <Picker
        selectedValue={desiredCurrency}
        onValueChange={setDesiredCurrency}
        style={styles.picker}
      >
        <Picker.Item label="USD – U.S. Dollar" value="USD" />
        <Picker.Item label="EUR – Euro" value="EUR" />
        <Picker.Item label="ILS – Israeli Shekel" value="ILS" />
        <Picker.Item label="GBP – British Pound" value="GBP" />
        <Picker.Item label="AUD – Australian Dollar" value="AUD" />
        <Picker.Item label="CAD – Canadian Dollar" value="CAD" />
      </Picker>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Passive mode</Text>
        <Switch
          value={passiveMode}
          onValueChange={setPassiveMode}
          thumbColor={passiveMode ? '#9C27B0' : '#f4f3f4'}
          trackColor={{ false: '#ccc', true: '#e1bee7' }}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>You can always edit your profile later</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4a0072',
    marginBottom: 24,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16
  },
  label: {
    marginBottom: 6,
    fontWeight: '500'
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16
  },
  currencySymbol: {
    fontSize: 18,
    marginRight: 8
  },
  salaryInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8
  },
  picker: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  switchLabel: {
    flex: 1,
    fontSize: 16
  },
  button: {
    backgroundColor: '#9C27B0',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    marginTop: 24
  }
});
