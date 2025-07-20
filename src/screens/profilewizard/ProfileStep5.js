// screens/profilewizard/ProfileStep5.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, Button, Alert } from 'react-native';
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
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Refine your match preferences</Text>
      <TextInput
        placeholder="Dream Company"
        value={dreamCompany}
        onChangeText={setDreamCompany}
        style={{ borderBottomWidth: 1, marginBottom: 12 }}
      />
      <TextInput
        placeholder="Preferred Industry"
        value={preferredIndustry}
        onChangeText={setPreferredIndustry}
        style={{ borderBottomWidth: 1, marginBottom: 12 }}
      />
      <TextInput
        placeholder="Match Threshold (e.g. 70)"
        value={matchThreshold}
        onChangeText={setMatchThreshold}
        keyboardType="numeric"
        style={{ borderBottomWidth: 1, marginBottom: 12 }}
      />

      <Text style={{ marginBottom: 6 }}>Desired Salary</Text>
<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
  <Text style={{ fontSize: 18, marginRight: 8 }}>
    {currencySymbols[desiredCurrency] || ''}
  </Text>
  <TextInput
    placeholder="Amount"
    value={desiredSalary}
    onChangeText={setDesiredSalary}
    keyboardType="numeric"
    style={{ flex: 1, borderBottomWidth: 1 }}
  />
</View>

<Text style={{ marginBottom: 6 }}>Currency</Text>
<Picker
  selectedValue={desiredCurrency}
  onValueChange={(val) => setDesiredCurrency(val)}
  style={{ backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 12 }}
>
  <Picker.Item label="USD – U.S. Dollar" value="USD" />
  <Picker.Item label="EUR – Euro" value="EUR" />
  <Picker.Item label="ILS – Israeli Shekel" value="ILS" />
  <Picker.Item label="GBP – British Pound" value="GBP" />
  <Picker.Item label="AUD – Australian Dollar" value="AUD" />
  <Picker.Item label="CAD – Canadian Dollar" value="CAD" />
</Picker>


      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ flex: 1 }}>Passive Mode</Text>
        <Switch
          value={passiveMode}
          onValueChange={setPassiveMode}
        />
      </View>
      <Button title="Next" onPress={handleNext} />
    </View>
  );
}
