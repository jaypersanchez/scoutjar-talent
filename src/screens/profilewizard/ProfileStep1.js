// screens/profilewizard/ProfileStep1.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  Alert, 
  TouchableOpacity, 
  FlatList,
  ScrollView
} from 'react-native';
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

    const userStr = await AsyncStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};

    const updatedDraft = {
      ...draft,
      ...payload,
      talent_id: user.talent_id, // ✅ Ensure talent_id is carried over
    };

    await AsyncStorage.setItem('onboardingDraft', JSON.stringify(updatedDraft));
    navigation.replace('ProfileStep2');
  } catch (err) {
    console.error('Failed to save onboarding draft:', err);
    Alert.alert('Error', 'Something went wrong while saving your data.');
  }
};


  return (
  <ScrollView contentContainerStyle={styles.container}>
    {/* Stepper */}
    <View style={styles.stepper}>
      {[1, 2, 3, 4, 5].map((step) => (
        <View key={step} style={[styles.stepCircle, step === 1 && styles.activeStep]}>
          <Text style={step === 1 ? styles.activeStepText : styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.title}>Let’s set your profile</Text>
    <Text style={styles.subtitle}>We'll start with the basics</Text>

    <TextInput
      placeholder="First Name"
      value={firstName}
      onChangeText={setFirstName}
      style={styles.input}
    />
    <TextInput
      placeholder="Last Name"
      value={lastName}
      onChangeText={setLastName}
      style={styles.input}
    />

    <TextInput
      placeholder="MM/DD/YY"
      value={birthdate}
      onChangeText={(text) => {
        const cleaned = text.replace(/\D/g, '');
        let formatted = '';
        if (cleaned.length <= 2) formatted = cleaned;
        else if (cleaned.length <= 4) formatted = `${cleaned.slice(0,2)}/${cleaned.slice(2)}`;
        else formatted = `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}/${cleaned.slice(4,6)}`;
        setBirthdate(formatted);
      }}
      keyboardType="numeric"
      maxLength={8}
      style={styles.input}
    />

    {/* Gender Dropdown */}
    <TouchableOpacity style={styles.input} onPress={() => setShowPicker(!showPicker)}>
      <Text style={{ color: gender ? '#000' : '#999' }}>
        {gender || 'Select Gender'}
      </Text>
    </TouchableOpacity>
    {showPicker && (
      <View style={styles.dropdown}>
        {['Male', 'Female', 'Prefer not to say'].map((opt) => (
          <TouchableOpacity key={opt} onPress={() => {
            setGender(opt);
            setShowPicker(false);
          }}>
            <Text style={styles.dropdownItem}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}

    <TextInput
      placeholder="Location"
      value={locationQuery}
      onChangeText={text => {
        setLocationQuery(text);
        setLocation(text);
      }}
      style={styles.input}
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
        <Text style={styles.dropdownItem}>{loc.label}</Text>
      </TouchableOpacity>
    ))}

    <View style={styles.buttonRow}>
      <TouchableOpacity style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>
    </View>

    <Text style={styles.note}>You can always edit your profile later</Text>
  </ScrollView>
);

}

const styles = {
  container: {
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  stepper: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#aaa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    borderColor: '#a259ff',
    backgroundColor: '#a259ff',
  },
  stepText: {
    color: '#aaa',
  },
  activeStepText: {
    color: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#f7f7f7',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  dropdown: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    paddingVertical: 6,
  },
  dropdownItem: {
    padding: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#a259ff',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  nextButton: {
    backgroundColor: '#a259ff',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  backText: {
    color: '#a259ff',
    fontWeight: 'bold',
  },
  nextText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    color: '#777',
    marginTop: 12,
    textAlign: 'center',
  },
};

