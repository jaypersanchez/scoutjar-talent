import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
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
    <View style={{ padding: 24, backgroundColor: '#fff', flex: 1 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#4A116A', marginBottom: 4 }}>
        Summarize your expertise
      </Text>
      <Text style={{ marginBottom: 20, color: '#555' }}>
        This is your first impression
      </Text>

      <TextInput
        placeholder="Write your bio..."
        placeholderTextColor="#999"
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={{
          backgroundColor: '#f7f7f7',
          borderRadius: 10,
          padding: 14,
          fontSize: 16,
          color: '#000',
          height: 120,
          marginBottom: 20,
        }}
      />

      <TouchableOpacity
        style={{
          backgroundColor: '#A259FF',
          paddingVertical: 14,
          borderRadius: 24,
          alignItems: 'center',
        }}
        onPress={handleNext}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Next</Text>
      </TouchableOpacity>

      <Text style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#777' }}>
        You can always edit your profile later
      </Text>
    </View>
  );
}
