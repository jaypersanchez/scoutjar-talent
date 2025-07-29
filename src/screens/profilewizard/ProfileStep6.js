import React from 'react';
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.title}>Upload your resume</Text>
      <Text style={styles.subtitle}>
        This helps us tailor your profile faster, but it's not required.
      </Text>

      <TouchableOpacity style={styles.buttonOutline} onPress={handleResumeUpload}>
        <Text style={styles.outlineText}>Upload Resume</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.replace('ProfileStep7')}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>You can always edit your profile later</Text>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flex: 1,
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
    alignItems: 'center',
    marginTop: 16
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  buttonOutline: {
    borderColor: '#9C27B0',
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center'
  },
  outlineText: {
    color: '#9C27B0',
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
