import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ChatComponent from '../../components/ChatComponent';
import Modal from '../../components/Modal';
import constants from '../../utils/constants';
import images from '../../utils/images';
import socket from '../../utils/socket';
import styles from './styles';
import {SwipeListView} from 'react-native-swipe-list-view';

const Chat = () => {
  const {t} = useTranslation();

  const [visible, setVisible] = useState(false);
  const [offset, setOffset] = useState(0);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState('');

  const getUsername = async () => {
    try {
      const value = await AsyncStorage.getItem('username');
      if (value !== null) {
        setUser(value);
        updateUser(value);
        fetchGroups(value);
      }
    } catch (e) {
      console.error('Error while loading username!');
    }
  };

  const fetchGroups = async (value: string) => {
    const params = {
      username: value,
      offset: offset,
    };

    axios
      .get(`${constants.ip}/api/chats`, {params})
      .then(response => {
        console.log('Response:', response?.data);
        setMessages(response?.data);
      })
      .catch(error => {
        console.error(
          'Error:',
          error.response ? error.response.data : error.message,
        );
      });
  };

  // useFocusEffect(
  //   React.useCallback(() => {
  //     fetchGroups(user);
  //     getMessages();
  //   }, []),
  // );

  const updateUser = (value: string) => {
    socket.emit('updateUser', value);
  };

  const getMessages = () => {
    socket.emit('getMessages', user);
  };

  useEffect(() => {
    getUsername();
    getMessages();
  }, []);

  useEffect(() => {
    socket.on('messageList', messagesList => {
      setMessages(messagesList);
      // function fetchGroups() {
      //   const params = {
      //     username: user,
      //     // add more parameters as needed
      //   };

      //   axios
      //     .get('http://localhost:4000/api/chats', {params})
      //     .then(response => {
      //       console.log('Response:', response.data);
      //     })
      //     .catch(error => {
      //       console.error(
      //         'Error:',
      //         error.response ? error.response.data : error.message,
      //       );
      //     });
      // }
      // fetchGroups(user);
      getUsername();
    });
  }, [socket]);

  return (
    <SafeAreaView style={styles.chatscreen}>
      <View style={styles.chattopContainer}>
        <View style={styles.chatheader}>
          <Text style={styles.chatheading}>{t('messaging')}</Text>
        </View>
      </View>

      <View style={styles.searchInputContainer}>
        <Image source={images.search} style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder={t('search')} />
      </View>

      <View style={styles.header}>
        <Text style={styles.discussHeadign}>{t('myDiscussions')}</Text>
        <TouchableOpacity>
          <Image source={images.filter} style={styles.filterImage} />
        </TouchableOpacity>
      </View>

      <View style={styles.chatlistContainer}>
        {messages.length > 0 ? (
          <SwipeListView
            data={messages}
            renderItem={({item}) => <ChatComponent item={item} />}
            keyExtractor={(item: any) => item?.id}
            renderHiddenItem={(data, rowMap) => {
              return (
                <View style={styles.rowContainer}>
                  <Text>Left</Text>
                  <Text>Right</Text>
                </View>
              );
            }}
            // leftOpenValue={75}
            disableRightSwipe
            rightOpenValue={-225}
          />
        ) : (
          <View style={styles.chatemptyContainer}>
            <Text style={styles.chatemptyText}>No messages!</Text>
            <Text>Add a user to start messaging</Text>
          </View>
        )}
      </View>
      {visible ? <Modal setVisible={setVisible} user={user} /> : ''}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.editButton}>
        <Image source={images.edit} style={styles.editImage} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Chat;
