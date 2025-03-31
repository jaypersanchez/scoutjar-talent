import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { commonStyles, colors } from './theme';

export default function HomeScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('talent');
      navigation.replace("Login");
    } catch (err) {
      console.error("❌ Failed to sign out:", err);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };
  

  const goToProfile = () => {
    navigation.navigate("Profile");
  };

  const fetchMatchingJobs = async () => {
    try {
      const talentStr = await AsyncStorage.getItem('talent');
      if (!talentStr) {
        Alert.alert("Error", "No talent profile found.");
        return;
      }

      const talent = JSON.parse(talentStr);

      const response = await fetch("http://localhost:5001/match-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talent_id: talent.talent_id }),
      });

      const result = await response.json();
      setJobs(result.matches || []);
    } catch (err) {
      console.error("❌ Failed to load jobs:", err);
      Alert.alert("Error", "Failed to load job matches.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job) => {
    try {
      const talentStr = await AsyncStorage.getItem('talent');
      if (!talentStr) {
        Alert.alert("Error", "Talent session not found.");
        return;
      }

      const talent = JSON.parse(talentStr);
      const payload = {
        talent_id: talent.talent_id,
        job_id: job.job_id
      };

      const response = await fetch('http://localhost:5000/job-applicants/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unknown error');
      }

      Alert.alert("✅ Applied", `Application submitted for "${job.job_title}"`);
      setJobs(prev => prev.filter(j => j.job_id !== job.job_id));
    } catch (error) {
      console.error("❌ Application failed:", error.message);
      Alert.alert("❌ Failed to apply", error.message);
    }
  };

  const handleReject = (job) => {
    Alert.alert("❌ Rejected", `You rejected ${job.job_title}`);
    setJobs(prev => prev.filter(j => j.job_id !== job.job_id));
  };

  useEffect(() => {
    fetchMatchingJobs();
  }, []);

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.white, marginTop: 12 }}>Loading job matches...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={commonStyles.container}>
      <Text style={[commonStyles.title, { fontSize: 24 }]}>🏡 Welcome to the Main/Home Screen!</Text>

      <TouchableOpacity style={commonStyles.button} onPress={goToProfile}>
        <Text style={commonStyles.buttonText}>Go to Profile</Text>
      </TouchableOpacity>

      {jobs.length === 0 ? (
        <Text style={{ color: colors.gray, marginTop: 12 }}>No matching jobs found.</Text>
      ) : (
        jobs.map((item) => (
          <View key={item.job_id} style={styles.jobItem}>
            <Text style={styles.jobTitle}>{item.job_title}</Text>
            <Text style={styles.jobDesc}>{item.job_description}</Text>
            {item.required_skills?.length > 0 && (
              <Text style={styles.skills}>Skills: {item.required_skills.join(', ')}</Text>
            )}
            <Text style={styles.match}>Match Score: {item.match_score}%</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item)}>
                <Text style={commonStyles.buttonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={() => handleApply(item)}>
                <Text style={commonStyles.buttonText}>Apply</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[commonStyles.button, { marginTop: 8 }]}
              onPress={() =>
                navigation.navigate('Messages', {
                  recruiter_id: item.recruiter_id,
                  job_id: item.job_id,
                  job_title: item.job_title,
                })
              }
            >
              <Text style={commonStyles.buttonText}>💬 Message Scout</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <TouchableOpacity
        style={[commonStyles.button, { backgroundColor: colors.danger, marginTop: 16 }]}
        onPress={handleSignOut}
      >
        <Text style={commonStyles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  jobItem: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  jobDesc: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 6,
  },
  skills: {
    fontSize: 13,
    color: '#bbb',
    marginTop: 8,
  },
  match: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 6,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  rejectBtn: {
    backgroundColor: colors.danger,
    padding: 10,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  applyBtn: {
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
});
