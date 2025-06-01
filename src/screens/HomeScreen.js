import React, { useEffect, useFocusEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
  Animated,
  Easing
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GestureRecognizer from 'react-native-swipe-gestures';
import {
  EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL,
  EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL
} from '@env';
import appliedIcon from '../../assets/icon-menu/appliedjobs.png';
import exitIcon from '../../assets/icon-menu/exit.png';
import profileIcon from '../../assets/icon-menu/profile.png';
import settingsIcon from '../../assets/icon-menu/settings.png';

export default function HomeScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [talent, setTalent] = useState(null);
  const [applicantCounts, setApplicantCounts] = useState({});
  const [recruiterInfoMap, setRecruiterInfoMap] = useState({});
  const [mode, setMode] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const translateX = new Animated.Value(0);

  const baseUrl = `${EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL}`;
  const AIbaseUrl = `${EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL}`;

  useFocusEffect(
    useCallback(() => {
      const fetchAndSetProfileMode = async () => {
        try {
          const user_id = await AsyncStorage.getItem("user_id");
          const response = await fetch(`${API_URL}/get-talent-profile/${user_id}`);
          const json = await response.json();
          const latestMode = json.profile_mode || "active";
          setProfileMode(latestMode);  // state used for matching logic
          await AsyncStorage.setItem("profile_mode", latestMode);
        } catch (e) {
          console.error("🔥 Failed to fetch profile mode", e);
        }
      };

      fetchAndSetProfileMode();
    }, [])
  );


  useEffect(() => {
    const loadData = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        const talentStr = await AsyncStorage.getItem('talent');

        if (userStr) setUser(JSON.parse(userStr));

        if (talentStr) {
          const parsedTalent = JSON.parse(talentStr);
          setTalent(parsedTalent);

          const profileMode = parsedTalent.profile_mode || 'active';
          setMode(profileMode);

          if (profileMode === 'passive') {
            await fetchPassiveMatches(parsedTalent.talent_id);
          } else {
            await fetchMatchingJobs(parsedTalent.talent_id);
          }

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

  const handleSwipe = (direction) => {
    if (direction === 'left' && currentIndex < jobs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'right' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const fetchPassiveMatches = async (talent_id) => {
    try {
      const res = await fetch(`${AIbaseUrl}/passive-matches/${talent_id}`);
      const data = await res.json();
      setJobs(data.matches || []);
    } catch (err) {
      console.error("❌ Failed to load passive matches:", err);
    }
  };

  const fetchMatchingJobs = async (talent_id) => {
    try {
      const response = await fetch(`${AIbaseUrl}/match-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const handleApply = async (job) => {
    try {
      const payload = {
        talent_id: talent.talent_id,
        job_id: job.job_id,
      };
      await fetch(`${baseUrl}/job-applicants/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
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

  const job = jobs[currentIndex];

  const animateSwipe = (direction, onComplete) => {
    const toValue = direction === 'left' ? -500 : 500;
    Animated.timing(translateX, {
      toValue,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => onComplete(job));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {loading ? (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#7D4AEA" />
          <Text style={{ color: '#000', marginTop: 12 }}>Loading Jobs...</Text>
        </View>
      ) : jobs.length === 0 ? (
        <View style={styles.container}>
          <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
            No matching jobs found.
          </Text>
        </View>
      ) : (
        <GestureRecognizer
          onSwipeLeft={() => animateSwipe('left', handleReject)}
          onSwipeRight={() => animateSwipe('right', handleApply)}
          config={{ velocityThreshold: 0.3, directionalOffsetThreshold: 80 }}
        >
          <Animated.View style={[styles.fullscreenCard, { transform: [{ translateX }] }]}>
            <Text style={styles.jobTitle}>{job.job_title || job.title}</Text>
            <Text style={styles.jobDesc}>{job.job_description || job.description}</Text>
            {(job.required_skills || job.skills_required)?.length > 0 && (
              <Text style={styles.skills}>
                Skills: {(job.required_skills || job.skills_required).join(', ')}
              </Text>
            )}
            <Text style={styles.matchScore}>Match Score: {Math.round(job.match_score)}%</Text>
            <Text style={styles.applicantCount}>Applicants: {applicantCounts[job.job_id] || 0}</Text>
          </Animated.View>
        </GestureRecognizer>
      )}

      {/* Footer ALWAYS visible */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerIconButton} onPress={() => navigation.navigate('Profile')}>
          <Image source={profileIcon} style={styles.footerImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerIconButton} onPress={() => navigation.navigate('AppliedJobs')}>
          <Image source={appliedIcon} style={styles.footerImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerIconButton} onPress={() => navigation.navigate('Settings')}>
          <Image source={settingsIcon} style={styles.footerImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerIconButton} onPress={handleSignOut}>
          <Image source={exitIcon} style={styles.footerImage} />
        </TouchableOpacity>
        <Text style={{ color: '#00C853', fontWeight: 'bold', fontSize: 16, marginTop: 14 }}>🚀 Active</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  fullscreenCard: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5ff',
    margin: 10,
    borderRadius: 12,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2727D9',
    marginBottom: 10,
  },
  jobDesc: {
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
  },
  skills: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 6,
  },
  matchScore: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#30a14e',
    marginBottom: 6,
  },
  applicantCount: {
    fontSize: 12,
    color: '#777',
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    elevation: 5,
  },
  footerIconButton: {
    backgroundColor: '#f0f0f5',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});
