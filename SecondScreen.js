import React, { useEffect, useState } from "react";
import { BackHandler, FlatList, StyleSheet, Text, TextInput, View, TouchableOpacity } from "react-native";
import { getFirestore, collection, query, onSnapshot, orderBy, addDoc } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import { convertFirebaseTimeStampToJS } from './helpers/Functions';

export default function SecondScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [senderName, setSenderName] = useState('');

  useEffect(() => {
    const db = getFirestore();
    const q = query(collection(db, 'messages'), orderBy('created', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        const tempMessages = [];
        querySnapshot.forEach((doc) => {
          const messageObject = {
            id: doc.id,
            name: doc.data().name,
            text: doc.data().text,
            created: convertFirebaseTimeStampToJS(doc.data().created)
          };
          tempMessages.push(messageObject);
        });
        setMessages(tempMessages);
      } catch (error) {
        console.error('Error retrieving messages:', error);
      }
    });

    // Add back button functionality
    BackHandler.addEventListener("hardwareBackPress", close);
    
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", close);
      unsubscribe();
    };
  }, []);

  const sendMessage = async () => {
    if (newMessage.trim() === '') {
      return; // Don't send empty messages
    }

    try {
      const db = getFirestore();
      const newMessageObject = {
        name: senderName,
        text: newMessage,
        created: new Date(),
      };
      await addDoc(collection(db, 'messages'), newMessageObject);
      setNewMessage(''); // Clear the input field
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  function close() {
    navigation.goBack(null);
    return true;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>Message from {item.name}:</Text>
            <Text>{item.text}</Text>
            <Text></Text>
            <Text style={styles.messageInfo}>{item.created}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your name..."
        value={senderName}
        onChangeText={(name) => setSenderName(name)}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your message..."
        value={newMessage}
        onChangeText={(text) => setNewMessage(text)}
      />
      <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  messageText: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  messageInfo: {
    fontSize: 12,
  },
});
