import React, { useEffect, useState, useCallback } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MessageScreen({ route }) {
  const { recruiter_id, job_id, job_title } = route.params;
  const [messages, setMessages] = useState([]);
  const [talent, setTalent] = useState(null);

  const fetchConversation = async (sender_id, recipient_id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/messages/history?sender_id=${sender_id}&recipient_id=${recipient_id}`
      );
      const data = await response.json();

      const formatted = data.reverse().map((msg) => ({
        _id: msg.message_id,
        text: msg.content,
        createdAt: new Date(msg.sent_at),
        user: {
          _id: msg.sender_id,
          name: msg.sender_id === sender_id ? 'You' : 'Recruiter',
        },
      }));

      setMessages(formatted);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const talentStr = await AsyncStorage.getItem('talent');
        const talentObj = JSON.parse(talentStr);
  
        if (!talentObj?.user_id || !recruiter_id) {
          console.error('❌ Missing talent.user_id or recruiter_id', {
            talentObj,
            recruiter_id,
          });
          return;
        }
  
        setTalent(talentObj);
        await fetchConversation(talentObj.user_id, recruiter_id);
      } catch (err) {
        console.error("❌ Error loading talent or messages:", err);
      }
    };
  
    load();
  }, [recruiter_id]);
  
  

  const onSend = useCallback(async (newMessages = []) => {
    const msg = newMessages[0];
  
    if (!talent?.user_id || !recruiter_id) {
      console.warn("Missing sender or recipient ID.");
      return;
    }
  
    try {
      const payload = {
        sender_id: talent.user_id,
        recipient_id: recruiter_id,
        content: msg.text,
      };
  
      const response = await fetch('http://localhost:5000/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
  
      // Use message_id and sent_at returned from server
      const messageWithMeta = {
        _id: result.message_id, // 💡 Important
        text: msg.text,
        createdAt: new Date(result.sent_at),
        user: {
          _id: talent.user_id,
          name: "You"
        }
      };
  
      setMessages((prevMessages) => GiftedChat.append(prevMessages, [messageWithMeta]));
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [talent, recruiter_id]);
  
  

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{ _id: talent?.user_id }}
      placeholder="Type your message..."
      showUserAvatar
      alwaysShowSend
    />
  );
}
