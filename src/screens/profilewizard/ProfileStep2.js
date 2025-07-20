import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileStep2({ navigation }) {
  const [bio, setBio] = useState('');
  const [talentId, setTalentId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('talent').then((t) => {
      if (t) {
        const profile = JSON.parse(t);
        setBio(profile.bio || '');
        setTalentId(profile.talent_id);
      }
    });
  }, []);

  const handleNext = async () => {
    if (!bio) {
      return Alert.alert('Missing Info', 'Please enter your bio.');
    }

    const payload = { bio };

    try {
      const existingDraft = await AsyncStorage.getItem('onboardingDraft');
      const draft = existingDraft ? JSON.parse(existingDraft) : {};
      const updatedDraft = { ...draft, ...payload };
      await AsyncStorage.setItem('onboardingDraft', JSON.stringify(updatedDraft));
      navigation.replace('ProfileStep3');
    } catch (err) {
      Alert.alert('Error', 'Failed to update your profile.');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Summarize your expertise</Text>
      <Text style={{ marginBottom: 12 }}>This is your first impression</Text>

      <TextInput
        placeholder="Write your bio..."
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={4}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 4,
          padding: 10,
          height: 100,
          marginBottom: 12,
        }}
      />

      <Button title="Next" onPress={handleNext} />
    </View>
  );
}
