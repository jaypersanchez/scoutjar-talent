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
import { SCOUTJAR_SERVER_BASE_URL, SCOUTJAR_SERVER_BASE_PORT } from '@env';
import { SCOUTJAR_AI_BASE_URL, SCOUTJAR_AI_BASE_PORT } from '@env';

export default function AppliedJobsScreen({ navigation }) {
  const baseUrl = `${SCOUTJAR_SERVER_BASE_URL}:${SCOUTJAR_SERVER_BASE_PORT}`;
  const AIbaseUrl = `${SCOUTJAR_AI_BASE_URL}:${SCOUTJAR_AI_BASE_PORT}`;

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
      await fetchApplicantCounts(); // 👈 added
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
            <Text style={styles.jobId}>🆔 Job ID: {item.job_id}</Text>
            <Text style={styles.jobDesc}>{item.job_description}</Text>

            {item.required_skills?.length > 0 && (
              <Text style={styles.skills}>Skills: {item.required_skills.join(', ')}</Text>
            )}

            <Text style={styles.status}>✅ Applied</Text>

            {/* 👇 Number of Applicants */}
            <Text style={{ color: colors.gray }}>
              Number of Applicants: {applicantCounts[item.job_id] || 0}
            </Text>

            {/* 👇 Recruiter Info */}
            {recruiterInfoMap[item.job_id] && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                {recruiterInfoMap[item.job_id].profile_image && (
                  <Image
                    source={{ uri: recruiterInfoMap[item.job_id].profile_image }}
                    style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                    resizeMode="cover"
                  />
                )}
                <View>
                  <Text style={{ color: colors.white }}>
                    Recruiter: {recruiterInfoMap[item.job_id].full_name}
                  </Text>
                  <Text style={{ color: colors.gray }}>
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
  jobId: {
    marginTop: 4,
    fontSize: 13,
    color: colors.muted || '#bbb',
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
  messageButton: {
    marginTop: 10,
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
