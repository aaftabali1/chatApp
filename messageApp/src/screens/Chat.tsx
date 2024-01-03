import React, {useEffect, useLayoutEffect, useState} from 'react';
import {View, Text, Pressable, SafeAreaView, FlatList} from 'react-native';

import ChatComponent from '../components/ChatComponent';
import {styles} from '../utils/styles';

import Modal from '../components/Modal';

import socket from '../utils/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Chat = () => {
  const [visible, setVisible] = useState(false);
  // const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState('');

  const getUsername = async () => {
    try {
      const value = await AsyncStorage.getItem('username');
      if (value !== null) {
        setUser(value);
      }
    } catch (e) {
      console.error('Error while loading username!');
    }
  };

  useLayoutEffect(() => {
    function fetchGroups() {
      fetch('http://localhost:4000/api')
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(err => console.error(err));
    }
    fetchGroups();
  }, []);

  useEffect(() => {
    getUsername();
  }, []);

  // useEffect(() => {
  //   socket.on('roomsList', rooms => {
  //     setRooms(rooms);
  //   });
  // }, [socket]);
  useEffect(() => {
    socket.on('messageList', messagesList => {
      setMessages(messagesList);
    });
  }, [socket]);

  return (
    <SafeAreaView style={styles.chatscreen}>
      <View style={styles.chattopContainer}>
        <View style={styles.chatheader}>
          <Text style={styles.chatheading}>Chats</Text>

          {/* Displays the Modal component when clicked */}
          <Pressable onPress={() => setVisible(true)}>
            <Text>Add User</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.chatlistContainer}>
        {messages.length > 0 ? (
          <FlatList
            data={messages}
            renderItem={({item}) => <ChatComponent item={item} />}
            keyExtractor={item => item.id}
          />
        ) : (
          <View style={styles.chatemptyContainer}>
            <Text style={styles.chatemptyText}>No rooms created!</Text>
            <Text>Click the icon above to create a Chat room</Text>
          </View>
        )}
      </View>
      {visible ? <Modal setVisible={setVisible} user={user} /> : ''}
    </SafeAreaView>
  );
};

export default Chat;
