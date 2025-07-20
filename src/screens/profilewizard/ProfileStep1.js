// screens/profilewizard/ProfileStep1.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL } from '@env';


export default function ProfileStep1({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showPicker, setShowPicker] = useState(false);


  useEffect(() => {
    AsyncStorage.getItem('talent').then((t) => {
      if (t) {
        const profile = JSON.parse(t);
        setFirstName(profile.full_name?.split(' ')[0] || '');
        setLastName(profile.full_name?.split(' ')[1] || '');
        setBirthdate(profile.birthdate || '');
        setGender(profile.gender || '');
        setLocation(profile.location || '');
        setLocationQuery(profile.location || '');
      }
    });
  }, []);

  useEffect(() => {
    if (locationQuery.length > 1) {
      fetch(`${EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL}/locations/all`)
      .then(response => response.json())
      .then(data => {
        const matches = data.filter(loc =>
          loc.label.toLowerCase().includes(locationQuery.toLowerCase())
        );
        setLocationSuggestions(matches.slice(0, 5));
      })
      .catch(err => console.error('Failed to fetch locations:', err));

    } else {
      setLocationSuggestions([]);
    }
  }, [locationQuery]);

  const handleNext = async () => {
    if (!firstName || !lastName) {
      return Alert.alert('Missing Info', 'Please enter your full name.');
    }

    const full_name = `${firstName} ${lastName}`;
    const payload = { full_name, birthdate, gender, location };

    try {
      const existingDraft = await AsyncStorage.getItem('onboardingDraft');
      const draft = existingDraft ? JSON.parse(existingDraft) : {};
      const updatedDraft = { ...draft, ...payload };
      await AsyncStorage.setItem('onboardingDraft', JSON.stringify(updatedDraft));
      navigation.replace('ProfileStep2');
    } catch (err) {
      Alert.alert('Error', 'Something went wrong while saving your data.');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Let's set your profile</Text>

      <TextInput placeholder="First Name" value={firstName} onChangeText={setFirstName} style={{ borderBottomWidth: 1, marginBottom: 12 }} />
      <TextInput placeholder="Last Name" value={lastName} onChangeText={setLastName} style={{ borderBottomWidth: 1, marginBottom: 12 }} />

      <Text style={{ marginBottom: 4 }}>Birthdate</Text>
      <TextInput
  placeholder="YYYY-MM-DD"
  value={birthdate}
  onChangeText={(text) => {
    const cleaned = text.replace(/\D/g, '');

    let formatted = '';
    if (cleaned.length <= 4) {
      formatted = cleaned;
    } else if (cleaned.length <= 6) {
      formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    } else {
      formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    }

    setBirthdate(formatted);
  }}
  keyboardType="numeric"
  maxLength={10}
  style={{ borderBottomWidth: 1, marginBottom: 12 }}
/>


      <Text style={{ marginBottom: 6 }}>Gender</Text>
      {['Male', 'Female', 'Prefer not to say'].map((opt) => (
        <TouchableOpacity key={opt} onPress={() => setGender(opt)} style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ height: 20, width: 20, marginRight: 8, borderRadius: 10, borderWidth: 1, borderColor: '#555', backgroundColor: gender === opt ? '#555' : 'transparent' }} />
          <Text>{opt}</Text>
        </TouchableOpacity>
      ))}

      <TextInput
        placeholder="Location"
        value={locationQuery}
        onChangeText={text => {
          setLocationQuery(text);
          setLocation(text);
        }}
        style={{ borderBottomWidth: 1, marginBottom: 12 }}
      />
      {locationSuggestions.map((loc) => (
        <TouchableOpacity
          key={loc.value}
          onPress={() => {
            setLocation(loc.label);
            setLocationQuery(loc.label);
            setLocationSuggestions([]);
          }}
        >
          <Text style={{ paddingVertical: 6, paddingHorizontal: 4 }}>{loc.label}</Text>
        </TouchableOpacity>
      ))}

      <Button title="Next" onPress={handleNext} />
    </View>
  );
}
