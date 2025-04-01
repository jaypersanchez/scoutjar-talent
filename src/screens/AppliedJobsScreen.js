import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { commonStyles, colors } from './theme';

export default function AppliedJobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppliedJobs = async (talent_id) => {
    try {
      const response = await fetch(`http://localhost:5000/job-applicants/talent/${talent_id}`);
      const data = await response.json();
      setJobs(data || []);
    } catch (error) {
      console.error("❌ Failed to load applied jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      const talentStr = await AsyncStorage.getItem('talent');
      if (!talentStr) return;

      const parsed = JSON.parse(talentStr);
      await fetchAppliedJobs(parsed.talent_id);
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.white, marginTop: 12 }}>Loading applied jobs...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={commonStyles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Back to Home</Text>
      </TouchableOpacity>

      <Text style={commonStyles.title}>📋 Jobs You Applied For</Text>
      {jobs.length === 0 ? (
        <Text style={{ color: colors.gray }}>No job applications found.</Text>
      ) : (
        jobs.map((item) => (
          <View key={item.job_id} style={styles.jobItem}>
            <Text style={styles.jobTitle}>{item.job_title}</Text>
            <Text style={styles.jobDesc}>{item.job_description}</Text>
            {item.required_skills?.length > 0 && (
              <Text style={styles.skills}>Skills: {item.required_skills.join(', ')}</Text>
            )}
            <Text style={styles.status}>✅ Applied</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: colors.card,
    borderRadius: 6,
  },
  backText: {
    color: colors.white,
    fontSize: 14,
  },
  jobItem: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  jobDesc: {
    color: colors.gray,
    marginVertical: 8,
  },
  skills: {
    color: colors.white,
    fontStyle: 'italic',
  },
  status: {
    marginTop: 6,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
