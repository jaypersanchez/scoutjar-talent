import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import {
  EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL,
  EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL,
} from '@env';
import * as DocumentPicker from 'expo-document-picker';
import saveIcon from '../../assets/icon-menu/save.png';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    talent_id: null,
    user_id: null,
    full_name: '',
    email: '',
    bio: '',
    resume: '',
    skills: '',
    experience: '',
    education: '',
    desired_salary: '',
    location: '',
    work_preferences: '',
    employment_type: '',
    availability: '',
    desired_currency: 'USD',
  });

  const [locations, setLocations] = useState([]);
  const [locationSearch, setLocationSearch] = useState('');

  const baseUrl = `${EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL}`;
  const AIbaseUrl = `${EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL}`;
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    ILS: '₪',
    GBP: '£',
    AUD: 'A$',
    CAD: 'C$' // Canadian Dollar (Loonie)
  };


  const handleUploadResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const formData = new FormData();

      formData.append('talent_id', profile.talent_id);
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/pdf',
      });

      const response = await fetch(`${AIbaseUrl}/upload-resume`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", data.message || "Resume uploaded successfully.");
        //fetchProfileData();  // ✅ Force re-fetch the updated profile
      } else {
        Alert.alert(
            "Upload Completed With Issues",
            `We couldn’t automatically parse all the details from your resume. 
        Resumes can vary a lot in layout, and sometimes sections are missed if the formatting is complex. 
        Your file was still uploaded, but please review and edit your profile manually to make sure your skills and experience are correct.

        Tip: Using a simpler resume layout with clear section headings like 'Skills', 'Experience', or 'Education' usually helps the parser do a better job.`
          );
      }
      //if (!response.ok) throw new Error(data.error || 'Upload failed');
      //Alert.alert('✅ Success', 'Resume uploaded and saved!');
    } catch (err) {
      console.error('❌ Resume upload error:', err);
      Alert.alert('Upload Error', err.message || 'Something went wrong.');
    }
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${baseUrl}/locations/all`);
        const data = await response.json();
        setLocations(data); // full list to filter
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    };

    fetchLocations();
  }, []);


  useEffect(() => {
    const loadProfile = async () => {
      try {
        const talentStr = await AsyncStorage.getItem('talent');
        const userStr = await AsyncStorage.getItem('user');
        if (!talentStr) {
          Alert.alert('Error', 'No talent data found in session');
          return;
        }
        const talent = JSON.parse(talentStr);
        const user = JSON.parse(userStr);
        console.log('👤 Loaded talent:', talent);
        console.log('📧 Loaded user:', user);

        setProfile({
          talent_id: talent.talent_id,
          user_id: talent.user_id,
          full_name: user.full_name || '',
          email: user.email || '',
          bio: talent.bio || '',
          resume: '',
          skills: Array.isArray(talent.skills) ? talent.skills.join(', ') : '',
          experience_level: talent.experience_level || '',
          education: talent.education || '',
          desired_salary: talent.desired_salary?.toString() || '',
          location: talent.location || '',
          work_preferences: talent.work_preferences || '',
          employment_type: talent.employment_type || '',
          availability: talent.availability || '',
          desired_currency: talent.desired_currency || '',
        
        });
      } catch (err) {
        console.error('❌ Failed to load profile from session:', err);
        Alert.alert('Error', 'Failed to load profile data.');
      }
    };
    loadProfile();
  }, []);

  const handleChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const requiredFields = {
      bio: profile.bio,
      skills: profile.skills,
      experience_level: profile.experience_level,
      education: profile.education,
      desired_salary: profile.desired_salary,
      location: profile.location,
      availability: profile.availability,
      employment_type: profile.employment_type,
      desired_currency: profile.desired_currency,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value || value.trim() === '') {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        Alert.alert('Required Field Missing', `Please complete the "${label}" field.`);
        return;
      }
    }

    try {
      const payload = {
        talent_id: profile.talent_id,
        full_name: profile.full_name,
        user_id: profile.user_id,
        bio: profile.bio,
        resume: profile.resume,
        skills: profile.skills.split(',').map((s) => s.trim()),
        experience_level: profile.experience_level,
        education: profile.education,
        work_preferences: profile.work_preferences,
        employment_type: profile.employment_type,
        desired_salary: parseFloat(profile.desired_salary || 0),
        location: profile.location,
        availability: profile.availability,
        desired_currency: profile.desired_currency,
      };

      const response = await fetch(`${baseUrl}/talent-profiles/update-talent-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      await AsyncStorage.setItem('talent', JSON.stringify(result));

      if (!response.ok) throw new Error(result.error || 'Failed to save profile');

      //await AsyncStorage.setItem('talent', JSON.stringify(result));
      /*const refreshed = await fetch(`${baseUrl}/talent-profiles/get-talent-profile/${profile.talent_id}`);
      const updatedTalent = await refreshed.json();
      await AsyncStorage.setItem('talent', JSON.stringify(updatedTalent));*/

      Alert.alert('✅ Success', 'Profile saved successfully!');
      navigation.navigate('Home');
    } catch (err) {
      console.error('❌ Save error:', err.message || err);
      Alert.alert('❌ Error', 'Failed to save profile. Check console for details.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 150 }}>
        <Text style={styles.pageTitle}>📝 Edit Your Profile - {profile.user_id}</Text>

        {renderField('Full Name', 'full_name', profile.full_name, handleChange, false, 'default', true)}
        <Text style={styles.label}>Email</Text>
        <Text style={[styles.input, { color: '#555', backgroundColor: '#eee' }]}>{profile.email}</Text>


        {renderField('Bio', 'bio', profile.bio, handleChange, true, 'default', true)}

        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <Text style={{ color: '#000', marginBottom: 6 }}>Upload Resume</Text>
          <TouchableOpacity style={[styles.footerIconButton, { backgroundColor: '#5555aa' }]} onPress={handleUploadResume}>
            <MaterialIcons name="upload-file" size={26} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {renderField('Skills (comma separated)', 'skills', profile.skills, handleChange, false, 'default', true)}

        {/*<Text style={styles.label}>Experience Level</Text>
        <Picker selectedValue={profile.experience} onValueChange={(val) => handleChange('experience', val)} style={styles.picker}>
          <Picker.Item label="Select..." value="" />
          <Picker.Item label="Senior" value="Senior" />
          <Picker.Item label="Intermediate" value="Intermediate" />
          <Picker.Item label="Junior" value="Junior" />
        </Picker>*/}

        <Text style={styles.label}>Experience Level</Text>
        <Picker
          selectedValue={profile.experience_level}
          onValueChange={(val) => handleChange('experience_level', val)}
          style={styles.picker}
        >
          <Picker.Item label="Select..." value="" />
          <Picker.Item label="Entry (0 years)" value="Entry" />
          <Picker.Item label="Junior (1–2 years)" value="Junior" />
          <Picker.Item label="Intermediate (2–5 years)" value="Intermediate" />
          <Picker.Item label="Senior (5+ years)" value="Senior" />
        </Picker>


        {renderField('Education', 'education', profile.education, handleChange, false, 'default', true)}

        <Text style={styles.label}>Work Preferences</Text>
        <Picker selectedValue={profile.work_preferences} onValueChange={(val) => handleChange('work_preferences', val)} style={styles.picker}>
          <Picker.Item label="Select..." value="" />
          <Picker.Item label="Remote" value="Remote" />
          <Picker.Item label="Hybrid" value="Hybrid" />
          <Picker.Item label="On-site" value="On-site" />
        </Picker>

        <Text style={styles.label}>Employment Type <Text style={{ color: 'red' }}>*</Text></Text>
        <Picker selectedValue={profile.employment_type} onValueChange={(val) => handleChange('employment_type', val)} style={styles.picker}>
          <Picker.Item label="Select..." value="" />
          <Picker.Item label="Full-time" value="Full-time" />
          <Picker.Item label="Part-time" value="Part-time" />
          <Picker.Item label="Contract" value="Contract" />
          <Picker.Item label="Freelancer" value="Freelancer" />
          <Picker.Item label="Hourly" value="Hourly" />
          <Picker.Item label="Internship" value="Internship" />
        </Picker>

        {/*renderField('Desired Salary', 'desired_salary', profile.desired_salary, handleChange, false, 'numeric', true)*/}
        <Text style={styles.label}>
          Desired Salary <Text style={{ color: 'red' }}>*</Text>
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, marginRight: 8 }}>
            {currencySymbols[profile.desired_currency] || ''}
          </Text>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={profile.desired_salary}
            onChangeText={(text) => handleChange('desired_salary', text)}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.label}>Currency</Text>
        <Picker
          selectedValue={profile.desired_currency}
          onValueChange={(val) => handleChange('desired_currency', val)}
          style={styles.picker}
        >
          <Picker.Item label="USD – U.S. Dollar" value="USD" />
          <Picker.Item label="EUR – Euro" value="EUR" />
          <Picker.Item label="ILS – Israeli Shekel" value="ILS" />
          <Picker.Item label="GBP – British Pound" value="GBP" />
          <Picker.Item label="AUD – Australian Dollar" value="AUD" />
          <Picker.Item label="CAD – Canadian Dollar" value="CAD" />
        </Picker>

        {/*renderField('Location', 'location', profile.location, handleChange, false, 'default', true)*/}
         <Text style={styles.label}>Location <Text style={{ color: 'red' }}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={locationSearch}
            onChangeText={(text) => {
              setLocationSearch(text);
              handleChange('location', text); // keep syncing to profile
            }}
            placeholder="Start typing city or country..."
          />

          {/* Autocomplete suggestions */}
          {locationSearch.length > 1 && (
            <View style={{ maxHeight: 200, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8 }}>
              {locations
                .filter(loc => loc.label.toLowerCase().includes(locationSearch.toLowerCase()))
                .slice(0, 5)
                .map((loc, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setLocationSearch(loc.value);
                      handleChange('location', loc.value);
                    }}
                    style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                  >
                    <Text>{loc.label}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
 
        <Text style={styles.label}>Availability <Text style={{ color: 'red' }}>*</Text></Text>
        <Picker selectedValue={profile.availability} onValueChange={(val) => handleChange('availability', val)} style={styles.picker}>
          <Picker.Item label="Select..." value="" />
          <Picker.Item label="Immediate" value="Immediate" />
          <Picker.Item label="Two Weeks Notice" value="Two Weeks Notice" />
          <Picker.Item label="1 Month" value="1 Month" />
          <Picker.Item label="3 Months" value="3 Months" />
          <Picker.Item label="Not Available" value="Not Available" />
        </Picker>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerIconButton}
          onPress={handleSave}
        >
          <Image source={saveIcon} style={styles.footerImage} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerIconButton}
          onPress={() => navigation.navigate('Home')}
        >
          <MaterialIcons name="home" size={26} color="#7D4AEA" />
        </TouchableOpacity>
      </View>


    </View>
  );
}

const renderField = (label, field, value, handleChange, multiline = false, keyboardType = 'default', required = false) => (
  <>
    <Text style={styles.label}>
      {label} {required && <Text style={{ color: 'red' }}>*</Text>}
    </Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={(text) => handleChange(field, text)}
      multiline={multiline}
      keyboardType={keyboardType}
    />
  </>
);

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 14,
    color: '#000000',
  },
  input: {
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    marginTop: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
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
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  footerIconButton: {
    backgroundColor: '#f0f0f5',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  footerIcon: {
    fontSize: 22,
    color: '#7D4AEA',
  },
});
