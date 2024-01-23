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
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MessageComponent from '../../components/MessageComponent';
import styles from './styles';
import socket from '../../utils/socket';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import images from '../../utils/images';
import constants from '../../utils/constants';

const Messaging = ({route}: any) => {
  const {t} = useTranslation();
  const navigation = useNavigation();

  const {item, user: name} = route.params;

  const id = item.id;

  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');
  const [offset, setOffset] = useState(0);
  const flatListRef = useRef<any>(null);

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
    // socket.emit('findUser', {
    //   id,
    //   receiver: item.receiverId,
    //   sender: item.senderId,
    // });
    // socket.on('foundUser', roomChats => {
    //   setTimeout(() => {
    //     flatListRef.current?.scrollToEnd({animated: true});
    //   }, 500);
    //   setChatMessages(roomChats);
    // });
  }, []);

  useEffect(() => {
    socket.emit('findUser', {
      id,
      receiver: item.receiverId,
      sender: item.senderId,
      offset,
    });
    socket.on('foundUser', roomChats => {
      setChatMessages(roomChats);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 500);
    });
  }, []);

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

    const messageObject = {
      message,
      chat_id: id,
      sender: item.senderId == user ? item.receiverId : item.senderId,
      receiver: user,
      timestamp: {hour, mins},
      offset,
    };

    socket.emit('newChatMessage', messageObject);
    setMessage('');
  };

  const userProfile = () => {
    return (
      <View
        style={[
          styles.profileContainer,
          {backgroundColor: 'white', flexDirection: 'column', padding: 0},
        ]}>
        <View style={styles.profileContainer}>
          <Image source={images.user} style={styles.profileImage} />
          <View style={styles.userDetailsContainer}>
            <Text style={styles.userFullName}>{name}</Text>
            <Text style={styles.goToProfile}>{t('profile')}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('IncomingVideoCall', {
                username: name,
                callType: constants.outgoingCall,
                currentUser: user,
              });
            }}>
            <Image source={images.video} style={styles.videoCallImage} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('IncomingVoiceCall', {
                username: name,
                callType: constants.outgoingCall,
                currentUser: user,
              });
            }}>
            <Image source={images.phoneCall} style={styles.voiceCallImage} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 20}
      style={styles.messagingscreen}>
      <View
        style={[
          styles.messagingscreen,
          {paddingVertical: 15, paddingHorizontal: 10},
        ]}>
        <FlatList
          ref={flatListRef}
          data={chatMessages?.length > 0 ? chatMessages : []}
          stickyHeaderIndices={[0]}
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
