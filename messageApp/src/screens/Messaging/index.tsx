import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  View,
  TextInput,
  Text,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MessageComponent from '../../components/MessageComponent';
import styles from './styles';
import socket from '../../utils/socket';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import images from '../../utils/images';

const Messaging = ({route}: any) => {
  const {t} = useTranslation();
  const navigation = useNavigation();

  const [chatMessages, setChatMessages] = useState([]);
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

  useEffect(() => {
    navigation.setOptions({tabBarVisible: false});
  }, []);

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

  const userProfile = () => {
    return (
      <View style={styles.profileContainer}>
        <Image source={images.user} style={styles.profileImage} />
        <View style={styles.userDetailsContainer}>
          <Text style={styles.userFullName}>Username</Text>
          <Text style={styles.username}>userid</Text>
          <Text style={styles.goToProfile}>Profile</Text>
        </View>
        <Image source={images.video} style={styles.videoCallImage} />
        <Image source={images.phoneCall} style={styles.voiceCallImage} />
      </View>
    );
  };

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
        <FlatList
          ref={flatListRef}
          data={chatMessages?.length > 0 ? chatMessages : []}
          ListHeaderComponent={userProfile}
          renderItem={({item}) => <MessageComponent item={item} user={user} />}
          keyExtractor={(item: any) => item.id}
        />
      </View>

      <SafeAreaView style={styles.messaginginputContainer}>
        <View style={styles.messaginginputContainerInner}>
          <Image source={images.user} style={styles.avtar} />
          <TextInput
            style={styles.messaginginput}
            value={message}
            placeholder={t('writeYourComment')}
            onChangeText={value => setMessage(value)}
          />
          <Pressable
            style={styles.messagingbuttonContainer}
            onPress={handleNewMessage}>
            <Image source={images.send} style={styles.sendImage} />
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Messaging;
