import React from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";

export default function TermsAndConditions() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>LOOKK-AI - Terms and Conditions</Text>

      <Text style={styles.paragraph}>
        Welcome to Lookk.ai (the "App"), a mobile application designed to connect job seekers with potential employers. By accessing or using the App, you agree to be bound by these Terms and Conditions ("Terms").
      </Text>

      <Text style={styles.subheading}>1. Acceptance of Terms</Text>
      <Text style={styles.paragraph}>
        By downloading, installing, or using the App, you signify your agreement to these Terms.
      </Text>

      <Text style={styles.subheading}>2. Description of Service</Text>
      <Text style={styles.paragraph}>• Job seekers can create profiles, search job openings, and apply.</Text>
      <Text style={styles.paragraph}>• Employers can post jobs and contact candidates.</Text>
      <Text style={styles.paragraph}>• Recruiters can match candidates with openings.</Text>

      <Text style={styles.subheading}>3. User Accounts</Text>
      <Text style={styles.paragraph}>• Provide accurate registration info.</Text>
      <Text style={styles.paragraph}>• You’re responsible for account security.</Text>
      <Text style={styles.paragraph}>• We can suspend your account for any violation.</Text>

      <Text style={styles.subheading}>4. User Content</Text>
      <Text style={styles.paragraph}>• You own your content but grant us a license to use it.</Text>
      <Text style={styles.paragraph}>• Do not post illegal, harmful, or misleading content.</Text>
      <Text style={styles.paragraph}>• Employer postings must be legit; resumes must be accurate.</Text>

      <Text style={styles.subheading}>5. Prohibited Conduct</Text>
      <Text style={styles.paragraph}>• No impersonation, hacking, viruses, spamming, or scraping.</Text>

      <Text style={styles.subheading}>6. Intellectual Property</Text>
      <Text style={styles.paragraph}>Everything in the app belongs to Lookk.ai or its licensors.</Text>

      <Text style={styles.subheading}>7. Disclaimer of Warranties</Text>
      <Text style={styles.paragraph}>The app is provided “as is” without warranties.</Text>

      <Text style={styles.subheading}>8. Limitation of Liability</Text>
      <Text style={styles.paragraph}>We’re not liable for damages or losses beyond what you paid to use the app.</Text>

      <Text style={styles.subheading}>9. Anonymity</Text>
      <Text style={styles.paragraph}>We’re not responsible if your employer sees your profile.</Text>

      <Text style={styles.subheading}>10. Third-Party Links</Text>
      <Text style={styles.paragraph}>We don’t control third-party sites linked in the app.</Text>

      <Text style={styles.subheading}>11. Indemnification</Text>
      <Text style={styles.paragraph}>You agree to indemnify us for damages resulting from your use or misuse.</Text>

      <Text style={styles.subheading}>12. Changes to Terms</Text>
      <Text style={styles.paragraph}>We can change terms; continued use means acceptance.</Text>

      <Text style={styles.subheading}>13. Governing Law</Text>
      <Text style={styles.paragraph}>These terms are governed by Israeli law.</Text>

      <Text style={styles.subheading}>14. Dispute Resolution</Text>
      <Text style={styles.paragraph}>Disputes are handled in Israel under applicable law.</Text>

      <Text style={styles.subheading}>15. Contact Us</Text>
      <Text style={styles.paragraph}>
        Contact us at{" "}
        <Text
          style={styles.link}
          onPress={() => Linking.openURL("mailto:andrew@lookai.com")}
        >
          andrew@lookai.com
        </Text>
        , Ha'Cabayim 19, Ramat Gan, Israel.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  link: {
    color: "#007bff",
    textDecorationLine: "underline",
  },
});
