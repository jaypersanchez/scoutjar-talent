import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { commonStyles, colors } from './theme';

export default function HomeScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [talent, setTalent] = useState(null);
  const [showApplied, setShowApplied] = useState(false);

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

  const fetchAppliedJobs = async (talent_id) => {
    try {
      const res = await fetch(`http://localhost:5000/job-applicants/talent/${talent_id}`);
      const data = await res.json();
      const jobIds = data.map(item => item.job_id);
      setAppliedJobs(jobIds);
    } catch (err) {
      console.error("❌ Failed to fetch applied jobs:", err);
    }
  };

  const fetchMatchingJobs = async (talent_id) => {
    try {
      const response = await fetch("http://localhost:5001/match-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talent_id }),
      });

      const result = await response.json();
      setJobs(result.matches || []);
    } catch (err) {
      console.error("❌ Failed to load jobs:", err);
      Alert.alert("Error", "Failed to load job matches.");
    }
  };

  const handleApply = async (job) => {
    try {
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
        if (response.status === 409) {
          Alert.alert("Already Applied", "You've already applied for this job.");
        } else {
          throw new Error(result.error || 'Unknown error');
        }
        return;
      }

      Alert.alert("✅ Applied", `Application submitted for "${job.job_title}"`);
      await fetchAppliedJobs(talent.talent_id);
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
    const loadData = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        const talentStr = await AsyncStorage.getItem('talent');

        if (userStr) setUser(JSON.parse(userStr));
        if (talentStr) {
          const parsedTalent = JSON.parse(talentStr);
          setTalent(parsedTalent);
          await fetchMatchingJobs(parsedTalent.talent_id);
          await fetchAppliedJobs(parsedTalent.talent_id);
        }
      } catch (err) {
        console.error("❌ Error loading session data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredJobs = showApplied
    ? jobs
    : jobs.filter(job => !appliedJobs.includes(job.job_id));

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.white, marginTop: 12 }}>Loading job matches...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={
        [commonStyles.container, { paddingBottom: 60, minHeight: '100%' }]
      } 
    >
      <Text style={[commonStyles.title, { fontSize: 20 }]}>
        🏡 Welcome {user?.full_name || "ScoutJar Talent"}!
      </Text>
      {talent && (
        <Text style={{ color: colors.gray, marginBottom: 10 }}>
          Talent ID: {talent.talent_id} | User ID: {talent.user_id}
        </Text>
      )}

      {/*<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: colors.white, marginRight: 8 }}>Show Applied Jobs</Text>
        <Switch
          value={showApplied}
          onValueChange={setShowApplied}
          thumbColor={showApplied ? colors.primary : colors.gray}
        />
      </View>*/}

      <TouchableOpacity style={commonStyles.button} onPress={goToProfile}>
        <Text style={commonStyles.buttonText}>Go to Profile</Text>
      </TouchableOpacity>

      {filteredJobs.length === 0 ? (
        <Text style={{ color: colors.gray, marginTop: 12 }}>No matching jobs found.</Text>
      ) : (
        filteredJobs.map((item) => (
          <View key={item.job_id} style={styles.jobItem}>
            <Text style={styles.jobTitle}>Job ID: {item.job_id || item.id}</Text>
            <Text style={styles.jobTitle}>{item.job_title || item.title}</Text>
            <Text style={styles.jobDesc}>{item.job_description || item.description}</Text>
            {(item.required_skills || item.skills_required)?.length > 0 && (
              <Text style={styles.skills}>
                Skills: {(item.required_skills || item.skills_required).join(', ')}
              </Text>
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
          </View>
        ))
      )}
      <TouchableOpacity style={commonStyles.button} onPress={() => navigation.navigate("AppliedJobs")}>
        <Text style={commonStyles.buttonText}>📋 View Past Applications</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[commonStyles.button, { backgroundColor: "#ff4444" }]} onPress={handleSignOut}>
        <Text style={commonStyles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  match: {
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  rejectBtn: {
    backgroundColor: colors.red,
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
  },
  applyBtn: {
    backgroundColor: colors.green,
    padding: 8,
    borderRadius: 4,
    flex: 1,
  },
});
