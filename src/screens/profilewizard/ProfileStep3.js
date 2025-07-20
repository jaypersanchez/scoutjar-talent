// screens/profilewizard/ProfileStep3.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
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
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Your experience matters</Text>
      <Text style={{ marginBottom: 12 }}>Highlight your strengths</Text>
      <TextInput
        placeholder="Skills (comma-separated)"
        value={skills}
        onChangeText={setSkills}
        style={{ borderBottomWidth: 1, marginBottom: 12 }}
      />

      <Text style={{ marginBottom: 6 }}>Job Title</Text>
      <Picker
        selectedValue={jobTitle}
        onValueChange={setJobTitle}
        style={{ borderBottomWidth: 1, marginBottom: 12 }}
      >
        <Picker.Item label="Select job title..." value="" />
        {jobTitles.map((title, idx) => (
          <Picker.Item
            key={idx}
            label={title.job_title}
            value={title.job_title}
          />
        ))}
      </Picker>

      <Text style={{ marginBottom: 6 }}>Experience Level</Text>
      <Picker
        selectedValue={experienceLevel}
        onValueChange={setExperienceLevel}
        style={{ borderBottomWidth: 1, marginBottom: 12 }}
      >
        <Picker.Item label="Select..." value="" />
        <Picker.Item label="Entry (0 years)" value="Entry" />
        <Picker.Item label="Junior (1–2 years)" value="Junior" />
        <Picker.Item label="Intermediate (2–5 years)" value="Intermediate" />
        <Picker.Item label="Senior (5+ years)" value="Senior" />
      </Picker>

      <Button title="Next" onPress={handleNext} />
    </View>
  );
}
