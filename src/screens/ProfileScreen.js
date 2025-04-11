import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { commonStyles, colors } from './theme';
import {
  EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL,
  EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_PORT,
  EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL,
  EXPO_PUBLIC_SCOUTJAR_AI_BASE_PORT
} from '@env';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    talent_id: null,
    user_id: null,
    bio: '',
    resume: '',
    skills: '',
    experience: '',
    education: '',
    desired_salary: '',
    location: '',
    work_preferences: '',
    employment_type: '',
    availability: '',
  });

  const baseUrl = `${EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL}` //:${SCOUTJAR_SERVER_BASE_PORT}`;
  const AIbaseUrl = `${EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL}` //:${SCOUTJAR_AI_BASE_PORT}`;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const talentStr = await AsyncStorage.getItem('talent');
        if (!talentStr) {
          Alert.alert('Error', 'No talent data found in session');
          return;
        }
        const talent = JSON.parse(talentStr);
        if (!talent?.talent_id) {
          Alert.alert('Error', 'Missing talent_id in session');
          return;
        }
        setProfile({
          talent_id: talent.talent_id,
          user_id: talent.user_id,
          bio: talent.bio || '',
          resume: talent.resume || '',
          skills: Array.isArray(talent.skills) ? talent.skills.join(', ') : '',
          experience: talent.experience || '',
          education: talent.education || '',
          desired_salary: talent.desired_salary?.toString() || '',
          location: talent.location || '',
          work_preferences: talent.work_preferences || '',
          employment_type: talent.employment_type || '',
          availability: talent.availability || '',
        });
      } catch (err) {
        console.error('❌ Failed to load profile from session:', err);
        Alert.alert('Error', 'Failed to load profile data.');
      }
    };
    loadProfile();
  }, []);

  const handleChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      if (!profile.talent_id) {
        Alert.alert('Error', 'Missing talent_id in profile data.');
        return;
      }

      const payload = {
        talent_id: profile.talent_id,
        bio: profile.bio,
        resume: profile.resume,
        skills: profile.skills.split(',').map((s) => s.trim()),
        experience: profile.experience,
        education: profile.education,
        work_preferences: profile.work_preferences,
        desired_salary: parseFloat(profile.desired_salary || 0),
        location: profile.location,
        availability: profile.availability,
      };

      const response = await fetch(`${baseUrl}/talent-profiles/update-talent-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save profile');

      await AsyncStorage.setItem('talent', JSON.stringify(result));
      Alert.alert('✅ Success', 'Profile saved successfully!');
      navigation.navigate('Home');
    } catch (err) {
      console.error('❌ Save error:', err.message || err);
      Alert.alert('❌ Error', 'Failed to save profile. Check console for details.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Text style={styles.pageTitle}>📝 Edit Your Profile</Text>

        {renderField('Bio', 'bio', profile.bio, handleChange, true)}
        {renderField('Resume', 'resume', profile.resume, handleChange, true)}
        {renderField('Skills (comma separated)', 'skills', profile.skills, handleChange)}

        <Text style={styles.label}>Experience Level</Text>
        <Picker
          selectedValue={profile.experience}
          onValueChange={(val) => handleChange('experience', val)}
          style={styles.picker}
        >
          <Picker.Item label="Select..." value="" />
          <Picker.Item label="Senior" value="Senior" />
          <Picker.Item label="Intermediate" value="Intermediate" />
          <Picker.Item label="Junior" value="Junior" />
        </Picker>

        {renderField('Education', 'education', profile.education, handleChange)}

        <Text style={styles.label}>Work Preferences</Text>
        <Picker
          selectedValue={profile.work_preferences}
          onValueChange={(val) => handleChange('work_preferences', val)}
          style={styles.picker}
        >
          <Picker.Item label="Select..." value="" />
          <Picker.Item label="Remote" value="Remote" />
          <Picker.Item label="Hybrid" value="Hybrid" />
          <Picker.Item label="On-site" value="On-site" />
        </Picker>

        <Text style={styles.label}>Employment Type</Text>
        <Picker
          selectedValue={profile.employment_type}
          onValueChange={(val) => handleChange('employment_type', val)}
          style={styles.picker}
        >
          <Picker.Item label="Select..." value="" />
          <Picker.Item label="Full-time" value="Full-time" />
          <Picker.Item label="Part-time" value="Part-time" />
          <Picker.Item label="Contract" value="Contract" />
          <Picker.Item label="Freelancer" value="Freelancer" />
          <Picker.Item label="Internship" value="Internship" />
        </Picker>

        {renderField('Desired Salary', 'desired_salary', profile.desired_salary, handleChange, false, 'numeric')}
        {renderField('Location', 'location', profile.location, handleChange)}

        <Text style={styles.label}>Availability</Text>
        <Picker
          selectedValue={profile.availability}
          onValueChange={(val) => handleChange('availability', val)}
          style={styles.picker}
        >
          <Picker.Item label="Select..." value="" />
          <Picker.Item label="Immediate" value="Immediate" />
          <Picker.Item label="Two Weeks Notice" value="Two Weeks Notice" />
          <Picker.Item label="1 Month" value="1 Month" />
          <Picker.Item label="3 Months" value="3 Months" />
          <Picker.Item label="Not Available" value="Not Available" />
        </Picker>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>💾 Save Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homeButtonText}>🏠 Go to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const renderField = (label, field, value, handleChange, multiline = false, keyboardType = 'default') => (
  <>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={(text) => handleChange(field, text)}
      multiline={multiline}
      keyboardType={keyboardType}
    />
  </>
);

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 14,
    color: '#000000',
  },
  input: {
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    marginTop: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#30a14e',
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: '#2727D9',
    padding: 14,
    borderRadius: 10,
    marginTop: 14,
  },
  homeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
