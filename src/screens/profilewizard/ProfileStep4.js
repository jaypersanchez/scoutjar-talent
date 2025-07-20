// screens/profilewizard/ProfileStep4.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
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
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Define your work preferences</Text>
      <Text style={{ marginBottom: 6 }}>Availability</Text>
      <Picker
        selectedValue={availability}
        onValueChange={setAvailability}
        style={{ backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 12 }}
      >
        <Picker.Item label="Select..." value="" />
        <Picker.Item label="Immediate" value="Immediate" />
        <Picker.Item label="Two Weeks Notice" value="Two Weeks Notice" />
        <Picker.Item label="1 Month" value="1 Month" />
        <Picker.Item label="3 Months" value="3 Months" />
        <Picker.Item label="Not Available" value="Not Available" />
      </Picker>

      <Text style={{ marginBottom: 6 }}>Work Mode</Text>
      <Picker
        selectedValue={workMode}
        onValueChange={setWorkMode}
        style={{ backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 12 }}
      >
        <Picker.Item label="Select..." value="" />
        <Picker.Item label="Remote" value="Remote" />
        <Picker.Item label="Hybrid" value="Hybrid" />
        <Picker.Item label="On-site" value="On-site" />
      </Picker>


      <Text style={{ marginBottom: 6 }}>Desired Salary</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 18, marginRight: 8 }}>
          {currencySymbols[currency] || ''}
        </Text>
        <TextInput
          style={{ flex: 1, borderBottomWidth: 1 }}
          value={desiredSalary}
          onChangeText={setDesiredSalary}
          keyboardType="numeric"
        />
      </View>

      {/*<Text style={{ marginTop: 12, fontWeight: 'bold' }}>Experience Level</Text>*/}
      <Picker
        selectedValue={experienceLevel}
        onValueChange={(val) => setExperienceLevel(val)}
        style={{ backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 12 }}
      >
        <Picker.Item label="Select..." value="" />
        <Picker.Item label="Entry (0 years)" value="Entry" />
        <Picker.Item label="Junior (1–2 years)" value="Junior" />
        <Picker.Item label="Intermediate (2–5 years)" value="Intermediate" />
        <Picker.Item label="Senior (5+ years)" value="Senior" />
      </Picker>

      <Text style={{ marginBottom: 6 }}>Currency</Text>
      <Picker
        selectedValue={currency}
        onValueChange={setCurrency}
        style={{ backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 12 }}
      >
        <Picker.Item label="USD – U.S. Dollar" value="USD" />
        <Picker.Item label="EUR – Euro" value="EUR" />
        <Picker.Item label="ILS – Israeli Shekel" value="ILS" />
        <Picker.Item label="GBP – British Pound" value="GBP" />
        <Picker.Item label="AUD – Australian Dollar" value="AUD" />
        <Picker.Item label="CAD – Canadian Dollar" value="CAD" />
      </Picker>


      <Button title="Next" onPress={handleNext} />
    </View>
  );
}
