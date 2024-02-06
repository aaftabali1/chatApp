import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
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
import MessageComponent from '../../components/MessageComponent';
import styles from './styles';
import socket from '../../utils/socket';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import images from '../../utils/images';
import constants from '../../utils/constants';
import {useSelector} from 'react-redux';
import {selectUsername} from '../../redux/slices/authSlice';

const Messaging = ({route}: any) => {
  const {t} = useTranslation();
  const username = useSelector(selectUsername);
  const navigation = useNavigation();
  const flatListRef = useRef<any>();

  const {item, receiver} = route.params;

  const id = item.id;

  const [chatMessages, setChatMessages] = useState<any>([]);
  const [message, setMessage] = useState('');
  const [offset, setOffset] = useState(0);
  const [showDownArrow, setShowDownArrow] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({title: receiver});
  }, []);

  const findUserCallback = useCallback(
    (roomChats: any) => {
      setChatMessages((prevData: any) => [...prevData, ...roomChats]);
    },
    [socket],
  );

  const getNewMessageCallback = useCallback(
    (chats: any) => {
      setChatMessages(chats);
    },
    [socket],
  );

  const fetchMessages = () => {
    socket.emit('findUser', {
      id,
      receiver: item.receiverId,
      sender: item.senderId,
      offset,
    });
  };

  useEffect(() => {
    fetchMessages();
  }, [offset]);

  const markMessagesRead = () => {
    socket.emit('messageRead', {
      chatId: id,
      senderId: username,
      receiverId: item.receiverId == username ? item.senderId : item.receiverId,
    });
  };

  useEffect(() => {
    markMessagesRead();
  }, []);

  useEffect(() => {
    socket.on('foundUser', findUserCallback);
    socket.on('getNewMessage', getNewMessageCallback);

    return () => {
      socket.off('foundUser', findUserCallback);
      socket.off('getNewMessage', getNewMessageCallback);
    };
  }, [findUserCallback, socket, getNewMessageCallback]);

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
      receiver: receiver,
      sender: username,
      timestamp: {hour, mins},
      offset: 0,
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
            <Text style={styles.userFullName}>{receiver}</Text>
            <Text style={styles.goToProfile}>{t('profile')}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('IncomingVideoCall', {
                username: receiver,
                callType: constants.outgoingCall,
                currentUser: username,
                callId: 0,
              });
            }}>
            <Image source={images.video} style={styles.videoCallImage} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('IncomingVoiceCall', {
                username: receiver,
                callType: constants.outgoingCall,
                currentUser: username,
              });
            }}>
            <Image source={images.phoneCall} style={styles.voiceCallImage} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowDownArrow(offsetY > 0);
  };

  const scrollToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({offset: 0, animated: true});
    }
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
        {userProfile()}
        <FlatList
          onEndReached={() => {
            setOffset(prevOffset => prevOffset + 1);
          }}
          ref={flatListRef}
          onEndReachedThreshold={0.2}
          data={chatMessages?.length > 0 ? chatMessages : []}
          inverted
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <MessageComponent item={item} user={username} />
          )}
          keyExtractor={(item: any, i: number) => `${i}-${item.id}`}
        />
      </View>

      {showDownArrow && (
        <TouchableOpacity style={styles.downArrow} onPress={scrollToTop}>
          <Text style={styles.downArrowImg}>▼</Text>
        </TouchableOpacity>
      )}
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
