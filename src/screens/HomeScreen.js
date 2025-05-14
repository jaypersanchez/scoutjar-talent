import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
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

export default function HomeScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [talent, setTalent] = useState(null);
  const [applicantCounts, setApplicantCounts] = useState({});
  const [recruiterInfoMap, setRecruiterInfoMap] = useState({});

  const baseUrl = `${EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL}`;
  const AIbaseUrl = `${EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL}`;
  const [mode, setMode] = useState(null); // default is "active"


  useEffect(() => {
  const loadData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const talentStr = await AsyncStorage.getItem('talent');

      if (userStr) setUser(JSON.parse(userStr));

      if (talentStr) {
        const parsedTalent = JSON.parse(talentStr);
        setTalent(parsedTalent);

        // ✅ Set profile mode from talent
        if (parsedTalent.profile_mode) {
          setMode(parsedTalent.profile_mode);
          console.log("🔄 Mode loaded from talent:", parsedTalent.profile_mode);
        } else {
          setMode('active');
          console.warn("⚠️ No profile_mode found in talent. Defaulting to active.");
        }

        // ✅ Fetch jobs depending on mode
        if (parsedTalent.profile_mode === 'passive') {
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


  /*useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const talentStr = await AsyncStorage.getItem('talent');
        if (talentStr) {
          const parsedTalent = JSON.parse(talentStr);
          setTalent(parsedTalent);
          await fetchMatchingJobs(parsedTalent.talent_id);
          await fetchAppliedJobs(parsedTalent.talent_id);
          await fetchApplicantCounts();
        }
      } catch (err) {
        console.error("❌ Error refreshing HomeScreen data:", err);
      }
    });

    return unsubscribe;
  }, [navigation]);*/
  /*useEffect(() => {
  const unsubscribe = navigation.addListener('focus', async () => {
    try {
      const talentStr = await AsyncStorage.getItem('talent');
      if (talentStr) {
        const parsedTalent = JSON.parse(talentStr);
        setTalent(parsedTalent);
        await fetchMatchingJobs(parsedTalent.talent_id);
        await fetchAppliedJobs(parsedTalent.talent_id);
        await fetchApplicantCounts();
      }
    } catch (err) {
      console.error("❌ Error refreshing HomeScreen data:", err);
    }
  });

  return unsubscribe;
}, [navigation]);*/

  
 /*useEffect(() => {
  const unsubscribe = navigation.addListener('focus', async () => {
    const mode = await AsyncStorage.getItem('profile_mode');
    if (mode) {
      setMode(mode);
      console.log("🛠 Profile Mode (on focus):", mode);
    }
  });

  return unsubscribe;
}, [navigation]);*/
  
/*useEffect(() => {
  const unsubscribe = navigation.addListener('focus', async () => {
    try {
      const talentStr = await AsyncStorage.getItem('talent');
      const mode = await AsyncStorage.getItem('profile_mode');

      if (mode) {
        setMode(mode);
        console.log("🛠 Profile Mode (on focus):", mode);
      }

      if (talentStr) {
        const parsedTalent = JSON.parse(talentStr);
        setTalent(parsedTalent);

        if (mode === 'passive') {
          await fetchPassiveMatches(parsedTalent.talent_id);
        } else {
          await fetchMatchingJobs(parsedTalent.talent_id);
        }

        await fetchAppliedJobs(parsedTalent.talent_id);
        await fetchApplicantCounts();
      }
    } catch (err) {
      console.error("❌ Error refreshing HomeScreen data:", err);
    }
  });

  return unsubscribe;
}, [navigation]);*/

useEffect(() => {
  const unsubscribe = navigation.addListener('focus', async () => {
    try {
      const talentStr = await AsyncStorage.getItem('talent');
      const modeStr = await AsyncStorage.getItem('profile_mode');

      if (talentStr) {
        const parsedTalent = JSON.parse(talentStr);

        // Override mode from AsyncStorage
        const effectiveMode = modeStr || parsedTalent.profile_mode || 'active';

        setTalent(parsedTalent);
        setMode(effectiveMode);
        console.log("🔁 Mode on focus:", effectiveMode);

        // Refetch jobs based on latest mode
        if (effectiveMode === 'passive') {
          await fetchPassiveMatches(parsedTalent.talent_id);
        } else {
          await fetchMatchingJobs(parsedTalent.talent_id);
        }

        await fetchAppliedJobs(parsedTalent.talent_id);
        await fetchApplicantCounts();
      }
    } catch (err) {
      console.error("❌ Error refreshing HomeScreen data:", err);
    }
  });

  return unsubscribe;
}, [navigation]);


const fetchPassiveMatches = async (talent_id) => {
  console.log(`${AIbaseUrl}/passive-matches/${talent_id}`)
  if (!talent_id || isNaN(talent_id)) {
    console.error("❌ Invalid or missing talent_id:", talent_id);
    return;
  }

  try {
    const res = await fetch(`${AIbaseUrl}/passive-matches/${talent_id}`);
    const data = await res.json();

    if (!Array.isArray(data.matches)) {
      console.error("❌ Invalid passive matches response:", data);
      return;
    }

    setJobs(data.matches);
  } catch (err) {
    console.error("❌ Failed to load passive matches:", err);
  }
};


  const fetchMatchingJobs = async (talent_id) => {
    try {
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
      <View style={[styles.container]}>
        <ActivityIndicator size="large" color="#7D4AEA" />
        <Text style={{ color: '#000', marginTop: 12 }}>Loading Jobs...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 150 }}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Image
            source={require('../../assets/lookk.png')}
            style={{ width: 160, height: 40, resizeMode: 'contain' }}
          />
        </View>
  
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#2727D9' }}>
          🏡 Welcome {user?.full_name || "LooKK Talent"}!
        </Text>
  
        {jobs.length === 0 ? (
          <Text style={{ color: '#555', textAlign: 'center' }}>No matching jobs found.</Text>
        ) : (
          jobs.map((job) => {
            const translateX = new Animated.Value(0);
  
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
              <GestureRecognizer
                key={job.job_id}
                onSwipeLeft={() => animateSwipe('left', handleReject)}
                onSwipeRight={() => animateSwipe('right', handleApply)}
                config={{ velocityThreshold: 0.3, directionalOffsetThreshold: 80 }}
              >
                <Animated.View style={[styles.jobCard, { transform: [{ translateX }] }]}>
                  <Text style={styles.jobTitle}>{job.job_title || job.title}</Text>
                  <Text style={styles.jobDesc}>{job.job_description || job.description}</Text>
                  {(job.required_skills || job.skills_required)?.length > 0 && (
                    <Text style={styles.skills}>
                      Skills: {(job.required_skills || job.skills_required).join(', ')}
                    </Text>
                  )}
                  <Text style={styles.matchScore}>Match Score: {Math.round(job.match_score)}%</Text>
                  <Text style={styles.applicantCount}>
                    Applicants: {applicantCounts[job.job_id] || 0}
                  </Text>
                  {recruiterInfoMap[job.job_id] && (
                    <View style={styles.recruiterContainer}>
                      {recruiterInfoMap[job.job_id].profile_image && (
                        <Image
                          source={{ uri: recruiterInfoMap[job.job_id].profile_image }}
                          style={styles.recruiterImage}
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
                </Animated.View>
              </GestureRecognizer>
            );
          })
        )}
      </ScrollView>
  
      {/* Fixed Footer with Icons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerIconButton} onPress={goToProfile}>
          <Text style={styles.footerIcon}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerIconButton} onPress={() => navigation.navigate('AppliedJobs')}>
          <Text style={styles.footerIcon}>🗂️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerIconButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.footerIcon}>⚙️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerIconButton]} onPress={handleSignOut}>
          <Text style={styles.footerIcon}>🚪</Text>
        </TouchableOpacity>
        
        {mode === 'passive' && jobs.length > 0 && (
          <TouchableOpacity
            style={styles.footerIconButton}
            onPress={() => Alert.alert("📢 Passive Match", "New job matches based on your dream criteria!")}
          >
            <Text style={styles.footerIcon}>🔔</Text>
          </TouchableOpacity>
        )}

        <Text style={{ textAlign: 'center', color: '#777', marginTop: 4 }}>
          {mode === 'active' ? '🚀 Active' : '😌 Passive'}
        </Text>
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
  jobCard: {
    backgroundColor: '#f5f5ff',
    borderLeftWidth: 6,
    borderLeftColor: '#7D4AEA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2727D9',
    marginBottom: 6,
  },
  jobDesc: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
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
  recruiterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  recruiterImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  recruiterText: {
    fontSize: 13,
    color: '#000',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerIconButton: {
    backgroundColor: '#ffffff', // ← WHITE
    borderWidth: 1,
    borderColor: '#ccc',        // Optional subtle border
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },  
  footerIcon: {
    fontSize: 22,
    color: '#ffffff',
  },
});
