import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL } from '@env';

export default function ProfileStep7({ navigation }) {
  const [draft, setDraft] = useState(null);
  const [user, setUser] = useState(null);
  const [payload, setPayload] = useState(null);
  const [talent, setTalent] = useState(null);

  useEffect(() => {
    const loadAsyncStorage = async () => {
      try {
        const draftStr = await AsyncStorage.getItem('onboardingDraft');
        const userStr = await AsyncStorage.getItem('user');
        const talentStr = await AsyncStorage.getItem('talent');

        const draftParsed = draftStr ? JSON.parse(draftStr) : {};
        const userParsed = userStr ? JSON.parse(userStr) : {};
        const talentParsed = talentStr ? JSON.parse(talentStr) : {};

        setDraft(draftParsed);
        setUser(userParsed);
        setTalent(talentParsed);

        const combinedPayload = {
          talent_id: talentParsed.talent_id,
          user_id: userParsed.user_id,
          full_name: (userParsed.full_name || '').toString(),
          email: (userParsed.email || '').toString(),
          bio: (draftParsed.bio || '').toString(),
          resume: '', // or draftParsed.resume if you support it
          skills: Array.isArray(draftParsed.skills)
            ? draftParsed.skills
            : typeof draftParsed.skills === 'string'
            ? draftParsed.skills.split(',').map(s => s.trim())
            : [],
          experience_level: (draftParsed.experience_level || '').toString(),
          education: (draftParsed.education || '').toString(),
          work_preferences:
            typeof draftParsed.work_preferences === 'object' && draftParsed.work_preferences !== null
              ? draftParsed.work_preferences
              : { work_mode: (draftParsed.work_preferences || 'Remote').toString() },
          employment_type: (draftParsed.employment_type || '').toString(),
          desired_salary: parseFloat((draftParsed.desired_salary || '0').toString().replace(/[^\d.]/g, '')),
          location: (draftParsed.location || '').toString(),
          availability: (draftParsed.availability || '').toString(),
          desired_currency: (draftParsed.desired_currency || 'USD').toString(),
        };

        setPayload(combinedPayload);
      } catch (err) {
        console.error('❌ Failed to load AsyncStorage:', err);
      }
    };

    loadAsyncStorage();
  }, []);

  const handleSubmit = async () => {
    try {
      console.log('📦 Final Payload to be sent:', payload);

      const res = await fetch(`${EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL}/talent-profiles/update-talent-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save profile to server');

      const result = await res.json();
      await AsyncStorage.setItem('onboraddrafttalent', JSON.stringify(result));
      await AsyncStorage.removeItem('onboardingDraft');
      navigation.replace('Home');
    } catch (err) {
      console.error('❌ Failed to save profile to DB:', err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>You're all set!</Text>
      <Text style={styles.subtitle}>
        Your profile is complete. Tap Submit to start looking for work.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit and Save Profile</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>You can always edit your profile later</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4a0072',
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24
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
    marginTop: 32
  }
});
