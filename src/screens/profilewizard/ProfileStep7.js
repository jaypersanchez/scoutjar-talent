import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
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
    <ScrollView contentContainerStyle={{ padding: 20 }}>
     {/*} <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        🚦 Step 7 Debug & Final Submit
      </Text>

      <Text style={{ fontSize: 16, fontWeight: '600' }}>📦 onboardingDraft:</Text>
      <Text selectable style={{ fontFamily: 'monospace', marginBottom: 20 }}>
        {JSON.stringify(draft, null, 2)}
      </Text>

      <Text style={{ fontSize: 16, fontWeight: '600' }}>👤 talent:</Text>
      <Text selectable style={{ fontFamily: 'monospace', marginBottom: 20 }}>
        {JSON.stringify(talent, null, 2)}
      </Text>

      <Text style={{ fontSize: 16, fontWeight: '600' }}>👤 user:</Text>
      <Text selectable style={{ fontFamily: 'monospace', marginBottom: 20 }}>
        {JSON.stringify(user, null, 2)}
      </Text>

      <Text style={{ fontSize: 16, fontWeight: '600' }}>📤 Final Payload to Submit:</Text>
      <Text selectable style={{ fontFamily: 'monospace', marginBottom: 20 }}>
        {JSON.stringify(payload, null, 2)}
      </Text>*/}
      <Text style={{ fontSize: 16, fontWeight: '600' }}>Your Profile is complete.  Tap on Submit to start looking work.</Text>
      <Button title="Submit and Save Profile" onPress={handleSubmit} />
    </ScrollView>
  );
}
