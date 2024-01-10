import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  View,
  TextInput,
  Text,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MessageComponent from '../components/MessageComponent';
import {styles} from '../utils/styles';
import socket from '../utils/socket';

const Messaging = ({route, navigation}: any) => {
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      text: 'Hello guys, welcome!',
      time: '07:50',
      user: 'Tomer',
    },
    {
      id: '2',
      text: 'Hi Tomer, thank you! 😇',
      time: '08:50',
      user: 'David',
    },
  ]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');
  const flatListRef = useRef<any>(null);

  //👇🏻 Access the chatroom's name and id
  const {name, id} = route.params;

  //👇🏻 This function gets the username saved on AsyncStorage
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

  //👇🏻 Sets the header title to the name chatroom's name
  useLayoutEffect(() => {
    navigation.setOptions({title: name});
    getUsername();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({title: name});
    socket.emit('findUser', id);
    socket.on('foundUser', roomChats => {
      flatListRef.current?.scrollToEnd();
      setChatMessages(roomChats);
    });
  }, []);

  useEffect(() => {
    socket.on('foundUser', roomChats => {
      setChatMessages(roomChats);
    });
  }, [socket]);

  /*👇🏻 
        This function gets the time the user sends a message, then 
        logs the username, message, and the timestamp to the console.
     */
  const handleNewMessage = () => {
    const hour =
      new Date().getHours() < 10
        ? `0${new Date().getHours()}`
        : `${new Date().getHours()}`;

    const mins =
      new Date().getMinutes() < 10
        ? `0${new Date().getMinutes()}`
        : `${new Date().getMinutes()}`;
    socket.emit('newChatMessage', {
      message,
      message_id: id,
      sender: user,
      timestamp: {hour, mins},
    });
    setMessage('');
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({animated: true});
  }, [chatMessages]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      style={styles.messagingscreen}>
      <View
        style={[
          styles.messagingscreen,
          {paddingVertical: 15, paddingHorizontal: 10},
        ]}>
        {chatMessages.length > 0 && chatMessages[0] ? (
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            renderItem={({item}) => (
              <MessageComponent item={item} user={user} />
            )}
            keyExtractor={item => item.id}
          />
        ) : (
          ''
        )}
      </View>

      <View style={styles.messaginginputContainer}>
        <TextInput
          style={styles.messaginginput}
          value={message}
          onChangeText={value => setMessage(value)}
        />
        <Pressable
          style={styles.messagingbuttonContainer}
          onPress={handleNewMessage}>
          <View>
            <Text style={{color: '#f2f0f1', fontSize: 20}}>SEND</Text>
          </View>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Messaging;
