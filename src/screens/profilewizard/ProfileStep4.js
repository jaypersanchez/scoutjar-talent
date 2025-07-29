// screens/profilewizard/ProfileStep4.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

export default function ProfileStep4({ navigation }) {
  const [availability, setAvailability] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [desiredSalary, setDesiredSalary] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [talentId, setTalentId] = useState(null);
  const [experienceLevel, setExperienceLevel] = useState('');

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
        setExperienceLevel(profile.experience_level || '');
        setAvailability(profile.availability || '');
        setWorkMode(profile.work_preferences?.work_mode || '');
        setDesiredSalary(profile.desired_salary?.toString() || '');
        setCurrency(profile.desired_currency || 'USD');
        setTalentId(profile.talent_id);
      }
    });
  }, []);

  const handleNext = async () => {
    const payload = {
      availability,
      work_preferences: { work_mode: workMode },
      desired_salary: parseFloat(desiredSalary),
      desired_currency: currency,
      experience_level: experienceLevel,
    };

    try {
      const existingDraft = await AsyncStorage.getItem('onboardingDraft');
      const draft = existingDraft ? JSON.parse(existingDraft) : {};
      const updatedDraft = { ...draft, ...payload };
      await AsyncStorage.setItem('onboardingDraft', JSON.stringify(updatedDraft));
      //navigation.replace('ProfileStep5');
      navigation.navigate('ProfileStep6'); //ProfileStep5 is for passive mode will skip this for now.
    } catch (err) {
      Alert.alert('Error', 'Failed to update your profile.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Define your work preferences</Text>
      <Text style={styles.subtitle}>Choose what fits you</Text>

      <Picker
        selectedValue={availability}
        onValueChange={setAvailability}
        style={styles.picker}
      >
        <Picker.Item label="Availability" value="" />
        <Picker.Item label="Immediate" value="Immediate" />
        <Picker.Item label="Two Weeks Notice" value="Two Weeks Notice" />
        <Picker.Item label="1 Month" value="1 Month" />
        <Picker.Item label="3 Months" value="3 Months" />
        <Picker.Item label="Not Available" value="Not Available" />
      </Picker>

      <Picker
        selectedValue={workMode}
        onValueChange={setWorkMode}
        style={styles.picker}
      >
        <Picker.Item label="Work mode" value="" />
        <Picker.Item label="Remote" value="Remote" />
        <Picker.Item label="Hybrid" value="Hybrid" />
        <Picker.Item label="On-site" value="On-site" />
      </Picker>

      <View style={styles.salaryContainer}>
        <Text style={styles.currencySymbol}>{currencySymbols[currency]}</Text>
        <TextInput
          style={styles.salaryInput}
          value={desiredSalary}
          onChangeText={setDesiredSalary}
          placeholder="Desired salary"
          keyboardType="numeric"
        />
      </View>

      <Picker
        selectedValue={currency}
        onValueChange={setCurrency}
        style={styles.picker}
      >
        <Picker.Item label="USD – U.S. Dollar" value="USD" />
        <Picker.Item label="EUR – Euro" value="EUR" />
        <Picker.Item label="ILS – Israeli Shekel" value="ILS" />
        <Picker.Item label="GBP – British Pound" value="GBP" />
        <Picker.Item label="AUD – Australian Dollar" value="AUD" />
        <Picker.Item label="CAD – Canadian Dollar" value="CAD" />
      </Picker>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>

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
    marginBottom: 4,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center'
  },
  picker: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  button: {
    backgroundColor: '#9C27B0',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  backButton: {
    backgroundColor: '#fff',
    borderColor: '#9C27B0',
    borderWidth: 1
  },
  backText: {
    color: '#9C27B0',
    fontWeight: '600'
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    marginTop: 24
  }
});