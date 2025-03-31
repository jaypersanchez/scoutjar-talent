import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Button,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { commonStyles } from './theme';

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

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const talentStr = await AsyncStorage.getItem('talent');
        if (!talentStr) {
          alert('No talent data in session');
          return;
        }

        const talent = JSON.parse(talentStr);
        if (!talent || typeof talent.talent_id === 'undefined') {
          alert('Missing talent_id in session');
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
        alert('Failed to load profile data.');
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
        return alert('❌ Missing talent_id in profile data.');
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

      const response = await fetch('http://172.22.105.132:5000/talent-profiles/update-talent-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to save profile');

      await AsyncStorage.setItem('talent', JSON.stringify(result));
      alert('✅ Profile saved successfully!');
    } catch (err) {
      console.error('❌ Save error:', err.message || err);
      alert('❌ Failed to save profile. Check console for details.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Bio</Text>
      <TextInput style={commonStyles.input} multiline value={profile.bio} onChangeText={(text) => handleChange('bio', text)} />

      <Text style={styles.label}>Resume</Text>
      <TextInput style={commonStyles.input} multiline value={profile.resume} onChangeText={(text) => handleChange('resume', text)} />

      <Text style={styles.label}>Skills (comma separated)</Text>
      <TextInput style={commonStyles.input} value={profile.skills} onChangeText={(text) => handleChange('skills', text)} />

      <Text style={styles.label}>Experience Level</Text>
      <Picker selectedValue={profile.experience} onValueChange={(val) => handleChange('experience', val)}>
        <Picker.Item label="Select..." value="" />
        <Picker.Item label="Senior" value="Senior" />
        <Picker.Item label="Intermediate" value="Intermediate" />
        <Picker.Item label="Junior" value="Junior" />
      </Picker>

      <Text style={styles.label}>Education</Text>
      <TextInput style={commonStyles.input} value={profile.education} onChangeText={(text) => handleChange('education', text)} />

      <Text style={styles.label}>Work Preferences</Text>
      <Picker selectedValue={profile.work_preferences} onValueChange={(val) => handleChange('work_preferences', val)}>
        <Picker.Item label="Select..." value="" />
        <Picker.Item label="Remote" value="Remote" />
        <Picker.Item label="Hybrid" value="Hybrid" />
        <Picker.Item label="On-site" value="On-site" />
      </Picker>

      <Text style={styles.label}>Employment Type</Text>
      <Picker selectedValue={profile.employment_type} onValueChange={(val) => handleChange('employment_type', val)}>
        <Picker.Item label="Select..." value="" />
        <Picker.Item label="Full-time" value="Full-time" />
        <Picker.Item label="Part-time" value="Part-time" />
        <Picker.Item label="Contract" value="Contract" />
        <Picker.Item label="Freelancer" value="Freelancer" />
        <Picker.Item label="Internship" value="Internship" />
      </Picker>

      <Text style={styles.label}>Desired Salary</Text>
      <TextInput style={commonStyles.input} keyboardType="numeric" value={profile.desired_salary} onChangeText={(text) => handleChange('desired_salary', text)} />

      <Text style={styles.label}>Location</Text>
      <TextInput style={commonStyles.input} value={profile.location} onChangeText={(text) => handleChange('location', text)} />

      <Text style={styles.label}>Availability</Text>
      <Picker selectedValue={profile.availability} onValueChange={(val) => handleChange('availability', val)}>
        <Picker.Item label="Select..." value="" />
        <Picker.Item label="Immediate" value="Immediate" />
        <Picker.Item label="Two Weeks Notice" value="Two Weeks Notice" />
        <Picker.Item label="1 Month" value="1 Month" />
        <Picker.Item label="3 Months" value="3 Months" />
        <Picker.Item label="Not Available" value="Not Available" />
      </Picker>

      <Button title="🏠 Go to Home" onPress={() => navigation.navigate('Home')} />
      <Button title="Save Profile" onPress={handleSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
});
