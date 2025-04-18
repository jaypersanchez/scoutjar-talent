import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GestureRecognizer from 'react-native-swipe-gestures';
import { commonStyles, colors } from './theme';
import {
  EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL,
  EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_PORT,
  EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL,
  EXPO_PUBLIC_SCOUTJAR_AI_BASE_PORT
} from '@env';

export default function HomeScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [talent, setTalent] = useState(null);
  const [applicantCounts, setApplicantCounts] = useState({});
  const [recruiterInfoMap, setRecruiterInfoMap] = useState({});

  const baseUrl = `${EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL}` //:${EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_PORT}`;
  const AIbaseUrl = `${EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL}`  //:${EXPO_PUBLIC_SCOUTJAR_AI_BASE_PORT}`;

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
          await fetchApplicantCounts();
        }
      } catch (err) {
        console.error("❌ Error loading session data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchMatchingJobs = async (talent_id) => {
    try {
      console.log(`${AIbaseUrl}/match-jobs`, talent_id)
      const response = await fetch(`${AIbaseUrl}/match-jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talent_id }),
      });
      const result = await response.json();
      setJobs(result.matches || []);
    } catch (err) {
      console.error("❌ Failed to load jobs:", err);
    }
  };

  const fetchAppliedJobs = async (talent_id) => {
    try {
      const res = await fetch(`${baseUrl}/job-applicants/talent/${talent_id}`);
      const data = await res.json();
      const jobIds = data.map(item => item.job_id);
      setAppliedJobs(jobIds);
    } catch (err) {
      console.error("❌ Failed to fetch applied jobs:", err);
    }
  };

  const fetchApplicantCounts = async () => {
    try {
      console.log("✅ BaseURL used for applicant counts:", baseUrl);
      const res = await fetch(`${baseUrl}/job-applicants/job-counts`);
      const data = await res.json();
      const countMap = {};
      data.forEach(({ job_id, applicant_count }) => {
        countMap[job_id] = applicant_count;
      });
      setApplicantCounts(countMap);
    } catch (err) {
      console.error("❌ Failed to fetch applicant counts:", err.message || err);
    }
  };

  const fetchRecruiterInfo = async (job_id) => {
    if (recruiterInfoMap[job_id]) return;
    try {
      const res = await fetch(`${AIbaseUrl}/recruiter-info/${job_id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get recruiter info");
      setRecruiterInfoMap(prev => ({ ...prev, [job_id]: data }));
    } catch (err) {
      console.error(`❌ Failed to fetch recruiter info for job ${job_id}:`, err);
    }
  };

  useEffect(() => {
    jobs.forEach(job => {
      fetchRecruiterInfo(job.job_id);
    });
  }, [jobs]);

  const handleApply = async (job) => {
    try {
      const payload = {
        talent_id: talent.talent_id,
        job_id: job.job_id,
      };
      const response = await fetch(`${baseUrl}/job-applicants/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Unknown error');
      }
      Alert.alert("✅ Applied", `You applied to "${job.job_title || job.title}"`);
      setJobs(prev => prev.filter(j => j.job_id !== job.job_id));
    } catch (error) {
      console.error("❌ Application failed:", error);
      Alert.alert("Failed to Apply", error.message);
    }
  };

  const handleReject = (job) => {
    Alert.alert("❌ Rejected", `You rejected "${job.job_title || job.title}"`);
    setJobs(prev => prev.filter(j => j.job_id !== job.job_id));
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('talent');
      navigation.replace('Login');
    } catch (err) {
      console.error('❌ Failed to sign out:', err);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const goToProfile = () => {
    navigation.navigate('Profile');
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: '#000000', marginTop: 12 }}>Loading Jobs...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        style={{ backgroundColor: '#FFFFFF' }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      >
        <Text style={[commonStyles.title, { fontSize: 20, color: '#000000', marginBottom: 20 }]}>
          🏡 Welcome {user?.full_name || "ScoutJar Talent"}!
        </Text>
  
        {jobs.length === 0 ? (
          <Text style={{ color: '#555555', marginTop: 20, textAlign: 'center' }}>
            No matching jobs found.
          </Text>
        ) : (
          jobs.map((job) => (
            <GestureRecognizer
              key={job.job_id}
              onSwipeLeft={() => handleReject(job)}
              onSwipeRight={() => handleApply(job)}
              config={{ velocityThreshold: 0.3, directionalOffsetThreshold: 80 }}
              style={styles.jobCard}
            >
              <Text style={styles.jobTitle}>{job.job_title || job.title}</Text>
              <Text style={styles.jobDesc}>{job.job_description || job.description}</Text>
  
              {(job.required_skills || job.skills_required)?.length > 0 && (
                <Text style={styles.skills}>
                  Skills: {(job.required_skills || job.skills_required).join(', ')}
                </Text>
              )}
  
              <Text style={styles.matchScore}>Match Score: {job.match_score}%</Text>
  
              <Text style={styles.applicantCount}>
                Number of Applicants: {applicantCounts[job.job_id] || 0}
              </Text>
  
              {recruiterInfoMap[job.job_id] && (
                <View style={styles.recruiterContainer}>
                  {recruiterInfoMap[job.job_id].profile_image && (
                    <Image
                      source={{ uri: recruiterInfoMap[job.job_id].profile_image }}
                      style={styles.recruiterImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.recruiterText}>
                      Recruiter: {recruiterInfoMap[job.job_id].full_name}
                    </Text>
                    <Text style={styles.recruiterText}>
                      Company: {recruiterInfoMap[job.job_id].company}
                    </Text>
                  </View>
                </View>
              )}
            </GestureRecognizer>
          ))
        )}
  
        {/* Footer Buttons */}
        <TouchableOpacity style={commonStyles.button} onPress={goToProfile}>
          <Text style={commonStyles.buttonText}>🏠 Go to Profile</Text>
        </TouchableOpacity>
  
        <TouchableOpacity style={commonStyles.button} onPress={() => navigation.navigate('AppliedJobs')}>
          <Text style={commonStyles.buttonText}>📋 View Past Applications</Text>
        </TouchableOpacity>
  
        <TouchableOpacity style={[commonStyles.button, { backgroundColor: '#ff4444' }]} onPress={handleSignOut}>
          <Text style={commonStyles.buttonText}>🚪 Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
  
}

const styles = StyleSheet.create({
  jobCard: {
    backgroundColor: '#2727D9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  jobDesc: {
    fontSize: 14,
    color: '#f3f3f3',
    marginBottom: 12,
    textAlign: 'center',
  },
  skills: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  matchScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#30a14e',
    textAlign: 'center',
    marginBottom: 8,
  },
  applicantCount: {
    fontSize: 13,
    color: '#f3f3f3',
    textAlign: 'center',
    marginBottom: 10,
  },
  recruiterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'center',
  },
  recruiterImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  recruiterText: {
    fontSize: 13,
    color: '#ffffff',
  },
});
