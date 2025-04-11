// RecruiterProfile.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, commonStyles } from './theme';
import { EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL, EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_PORT } from '@env';
import { EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL, EXPO_PUBLIC_SCOUTJAR_AI_BASE_PORT } from '@env';

const RecruiterProfile = ({ route }) => {
  const { recruiter_id } = route.params;
  const [recruiter, setRecruiter] = useState(null);
  const [loading, setLoading] = useState(true);
  const baseUrl = `${EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL}` //:${SCOUTJAR_SERVER_BASE_PORT}`;
  const AIbaseUrl = `${EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL}` //:${SCOUTJAR_AI_BASE_PORT}`; 

  useEffect(() => {
    const fetchRecruiter = async () => {
      try {
        const response = await fetch(`${baseUrl}/recruiter-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recruiter_id })
        });
        const data = await response.json();
        setRecruiter(data.recruiter);
      } catch (err) {
        console.error('Error fetching recruiter profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiter();
  }, [recruiter_id]);

  if (loading) {
    return (
      <View style={[commonStyles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!recruiter) {
    return (
      <View style={commonStyles.container}>
        <Text style={styles.error}>Recruiter profile not found.</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <Text style={styles.name}>{recruiter.full_name}</Text>
      <Text style={styles.bio}>{recruiter.bio}</Text>
      <Text style={styles.contact}>📧 {recruiter.email}</Text>
      <Text style={styles.org}>🏢 {recruiter.organization}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text
  },
  bio: {
    color: colors.text,
    marginVertical: 10
  },
  contact: {
    color: colors.accent
  },
  org: {
    color: colors.text
  },
  error: {
    color: 'red'
  }
});

export default RecruiterProfile;
