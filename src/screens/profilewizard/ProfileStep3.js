// screens/profilewizard/ProfileStep3.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL } from '@env';
import { Picker } from '@react-native-picker/picker';


export default function ProfileStep3({ navigation }) {
  const [skills, setSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [talentId, setTalentId] = useState(null);
  const [jobTitles, setJobTitles] = useState([]);
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('talent').then((t) => {
      if (t) {
        const profile = JSON.parse(t);
        setSkills((profile.skills || []).join(', '));
        setExperienceLevel(profile.experience_level || '');
        setTalentId(profile.talent_id);
      }
    });
  }, []);

  useEffect(() => {
  const fetchJobTitles = async () => {
    try {
      const res = await fetch(`${EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL}/job-titles`);
      const data = await res.json();
      setJobTitles(data); // data is an array of job title strings
    } catch (err) {
      console.error('Failed to fetch job titles:', err);
    }
  };

  fetchJobTitles();
}, []);


  const handleNext = async () => {
    if (!skills.trim()) {
      return Alert.alert('Missing Info', 'Please enter at least one skill.');
    }

    const payload = {
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      experience_level: experienceLevel,
      job_title: jobTitle,
    };

    try {
      const existingDraft = await AsyncStorage.getItem('onboardingDraft');
      const draft = existingDraft ? JSON.parse(existingDraft) : {};
      const updatedDraft = { ...draft, ...payload };
      await AsyncStorage.setItem('onboardingDraft', JSON.stringify(updatedDraft));
      navigation.replace('ProfileStep4');
    } catch (err) {
      Alert.alert('Error', 'Failed to update your profile.');
    }
  };

  return (
  <ScrollView contentContainerStyle={styles.container}>
    {/* Stepper */}
    <View style={styles.stepper}>
      {[1, 2, 3, 4, 5].map((step) => (
        <View key={step} style={[styles.stepCircle, step === 3 && styles.activeStep]}>
          <Text style={step === 3 ? styles.activeStepText : styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.title}>Your experience matters</Text>
    <Text style={styles.subtitle}>Highlight your strengths</Text>

    <TextInput
      placeholder="Write your skills..."
      placeholderTextColor="#999"
      value={skills}
      onChangeText={setSkills}
      multiline
      style={[styles.input, { height: 100 }]}
    />

    <Text style={styles.label}>Industry Experience</Text>
    <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={jobTitle}
        onValueChange={setJobTitle}
        style={styles.picker}
        dropdownIconColor="#555"
      >
        <Picker.Item label="Select job title..." value="" />
        {jobTitles.map((title, idx) => (
          <Picker.Item key={idx} label={title.job_title} value={title.job_title} />
        ))}
      </Picker>
    </View>

    <Text style={styles.label}>Years of Experience</Text>
    <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={experienceLevel}
        onValueChange={setExperienceLevel}
        style={styles.picker}
        dropdownIconColor="#555"
      >
        <Picker.Item label="Select..." value="" />
        <Picker.Item label="Entry (0 years)" value="Entry" />
        <Picker.Item label="Junior (1–2 years)" value="Junior" />
        <Picker.Item label="Intermediate (2–5 years)" value="Intermediate" />
        <Picker.Item label="Senior (5+ years)" value="Senior" />
      </Picker>
    </View>

    <View style={styles.buttonRow}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'center',
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
    color: '#4A116A',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    marginBottom: 6,
    color: '#4A116A',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  pickerWrapper: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
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
    textAlign: 'center',
    marginTop: 12,
    fontSize: 12,
    color: '#777',
  },
};

