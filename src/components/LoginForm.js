import React from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

export default function LoginForm({ onSignIn }) {
  return (
    <View>
      <TextInput placeholder="Email" style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} />
      <Button title="Login" onPress={() => onSignIn({ email: 'test', password: '123' })} />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
  },
});
