import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

export default function ProfileStep6({ navigation }) {
  const handleResumeUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    });

    if (result?.assets?.length > 0) {
      Alert.alert('Resume Selected', result.assets[0].name);
      // You can optionally handle upload logic here
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Upload your resume</Text>
      <Text style={{ marginBottom: 20 }}>This helps us tailor your profile faster, but it's not required.</Text>

      <Button title="Upload Resume" onPress={handleResumeUpload} />

      <View style={{ height: 20 }} />

      <Button title="Next" onPress={() => navigation.replace('ProfileStep7')} />
    </View>
  );
}
