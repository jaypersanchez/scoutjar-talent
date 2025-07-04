import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { commonStyles, colors } from './theme';
import { EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL } from '@env';
import { EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL } from '@env';

export default function MessageScreen({ route, navigation }) {
  const { recruiter_id, job_id, job_title } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [talent, setTalent] = useState(null);
  const flatListRef = useRef(null);

  const baseUrl = `${EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL}`;
  const AIbaseUrl = `${EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL}`;

  const fetchConversation = async (sender_id, recipient_id) => {
    try {
      const response = await fetch(
        `${baseUrl}/messages/history?sender_id=${sender_id}&recipient_id=${recipient_id}`
      );
      const data = await response.json();
      const formatted = data.map((msg) => ({
        id: msg.message_id,
        text: msg.content,
        sentAt: new Date(msg.sent_at),
        senderId: msg.sender_id,
      }));
      setMessages(formatted);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  useEffect(() => {
    let intervalId;
    let isMounted = true;

    const startPolling = async () => {
      try {
        const talentStr = await AsyncStorage.getItem('talent');
        const talentObj = JSON.parse(talentStr);
        if (!talentObj?.talent_id || !recruiter_id) return;

        setTalent(talentObj);
        await fetchConversation(talentObj.user_id, recruiter_id);

        intervalId = setInterval(() => {
          if (isMounted) {
            fetchConversation(talentObj.user_id, recruiter_id);
          }
        }, 5000);
      } catch (err) {
        console.error("❌ Error initializing polling:", err);
      }
    };

    startPolling();
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [recruiter_id]);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !talent?.talent_id || !recruiter_id) return;

    try {
      const payload = {
        sender_id: talent.user_id,
        recipient_id: recruiter_id,
        content: input.trim(),
      };

      await fetch(`${baseUrl}/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setInput('');
      await fetchConversation(talent.talent_id, recruiter_id);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const renderItem = ({ item }) => {
    const isMine = item.senderId === talent?.user_id;
 //const isMine = item.senderId === talent?.talent_id;
    return (
      <View style={{ marginBottom: 12 }}>
        <Text style={[styles.senderLabel, { textAlign: isMine ? 'right' : 'left' }]}>
          {isMine ? 'You' : 'Recruiter'}
        </Text>
        <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.timestamp}>{new Date(item.sentAt).toLocaleTimeString()}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={[commonStyles.button, { margin: 12 }]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={commonStyles.buttonText}>🏠 Back to Home</Text>
        </TouchableOpacity>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputBox}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={commonStyles.buttonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  messageList: {
    padding: 12,
    paddingBottom: 70,
  },
  senderLabel: {
    fontSize: 11,
    color: '#bbb',
    marginBottom: 2,
    marginHorizontal: 6,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 4,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  theirMessage: {
    backgroundColor: '#444',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  messageText: {
    color: colors.white,
    fontSize: 15,
  },
  timestamp: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1e1e1e',
  },
  inputBox: {
    flex: 1,
    color: '#fff',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
