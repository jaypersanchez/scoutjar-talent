import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { commonStyles, colors } from './theme';
import {
  EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL,
  EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_PORT,
  EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL,
  EXPO_PUBLIC_SCOUTJAR_AI_BASE_PORT
} from '@env';

export default function AppliedJobsScreen({ navigation }) {
  const baseUrl = `${EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL}` //:${EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_PORT}`;
  const AIbaseUrl = `${EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL}` //:${EXPO_PUBLIC_SCOUTJAR_AI_BASE_PORT}`;

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recruiterInfoMap, setRecruiterInfoMap] = useState({});
  const [applicantCounts, setApplicantCounts] = useState({});

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

  const fetchApplicantCounts = async () => {
    try {
      const res = await fetch(`${baseUrl}/job-applicants/job-counts`);
      const data = await res.json();
      const countMap = {};
      data.forEach(({ job_id, applicant_count }) => {
        countMap[job_id] = applicant_count;
      });
      setApplicantCounts(countMap);
    } catch (err) {
      console.error("❌ Failed to fetch applicant counts:", err);
    }
  };

  const fetchAppliedJobs = async (talent_id) => {
    try {
      const response = await fetch(`${baseUrl}/job-applicants/talent/${talent_id}`);
      const data = await response.json();
      setJobs(data || []);
      data.forEach(job => fetchRecruiterInfo(job.job_id));
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
      await fetchApplicantCounts();
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: '#000000', marginTop: 12 }}>Loading applied jobs...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back to Home</Text>
        </TouchableOpacity>

        <Text style={[commonStyles.title, { fontSize: 20, color: '#000000', marginBottom: 20 }]}>
          📋 Jobs You Applied For
        </Text>

        {jobs.length === 0 ? (
          <Text style={{ color: '#555555' }}>No job applications found.</Text>
        ) : (
          jobs.map((item) => (
            <View key={item.job_id} style={styles.jobItem}>
              <Text style={styles.jobTitle}>{item.job_title}</Text>
              <Text style={styles.jobId}>🆔 Job ID: {item.job_id}</Text>
              <Text style={styles.jobDesc}>{item.job_description}</Text>

              {item.required_skills?.length > 0 && (
                <Text style={styles.skills}>
                  Skills: {item.required_skills.join(', ')}
                </Text>
              )}

              <Text style={styles.status}>✅ Applied</Text>

              <Text style={{ color: '#777', marginTop: 4 }}>
                Number of Applicants: {applicantCounts[item.job_id] || 0}
              </Text>

              {recruiterInfoMap[item.job_id] && (
                <View style={styles.recruiterContainer}>
                  {recruiterInfoMap[item.job_id].profile_image && (
                    <Image
                      source={{ uri: recruiterInfoMap[item.job_id].profile_image }}
                      style={styles.recruiterImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.recruiterText}>
                      Recruiter: {recruiterInfoMap[item.job_id].full_name}
                    </Text>
                    <Text style={styles.recruiterCompany}>
                      Company: {recruiterInfoMap[item.job_id].company}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.messageButton}
                onPress={() =>
                  navigation.navigate('MessageScreen', {
                    recruiter_id: item.recruiter_id,
                    job_id: item.job_id,
                    job_title: item.job_title,
                  })
                }
              >
                <Text style={styles.messageText}>💬 Message Recruiter</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2727D9',
    borderRadius: 8,
    marginBottom: 20,
  },
  backText: {
    color: '#ffffff',
    fontSize: 14,
  },
  jobItem: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  jobId: {
    marginTop: 4,
    fontSize: 13,
    color: '#888',
  },
  jobDesc: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
  skills: {
    marginTop: 8,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#333',
  },
  status: {
    marginTop: 8,
    color: '#30a14e',
    fontWeight: 'bold',
  },
  recruiterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  recruiterImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  recruiterText: {
    fontSize: 13,
    color: '#000000',
  },
  recruiterCompany: {
    fontSize: 13,
    color: '#555555',
  },
  messageButton: {
    marginTop: 12,
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
