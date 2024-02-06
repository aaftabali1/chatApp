import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useEffect, useState} from 'react';
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
import images from '../../utils/images';
import socket from '../../utils/socket';
import styles from './styles';
import {SwipeListView} from 'react-native-swipe-list-view';
import {useDispatch, useSelector} from 'react-redux';
import {selectUsername, setUsername} from '../../redux/slices/authSlice';
import {useFocusEffect} from '@react-navigation/native';
import {globalStyles} from '../../utils/commonStyles';
import ChatFilter from '../../components/ChatFilter';
import ChatAction from '../../components/ChatAction';

const Chat = () => {
  const {t} = useTranslation();

  const dispatch = useDispatch();
  const username = useSelector(selectUsername);

  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filterValue, setFilterValue] = useState(0);
  const [showChatActions, setShowChatActions] = useState(false);

  useEffect(() => {
    getUsername();
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      getMessages();
      return () => {};
    }, [username]),
  );

  const getUsername = async () => {
    try {
      const value = await AsyncStorage.getItem('username');
      if (value !== null) {
        dispatch(setUsername(value));
      }
    } catch (e) {
      console.error('Error while loading username!');
    }
  };

  const updateUser = (value: string) => {
    socket.emit('updateUser', value);
  };

  const getMessages = () => {
    socket.emit('getMessages', username);
  };

  useEffect(() => {
    if (username == null) return;
    getMessages();
    updateUser(username);
  }, [username]);

  const messageListCallback = useCallback(
    async (messagesList: any) => {
      setMessages(messagesList);
      getUsername();
    },
    [socket, getUsername],
  );

  useEffect(() => {
    socket.on('allMessageList', messageListCallback);
    return () => {
      socket.off('allMessageList', messageListCallback);
    };
  }, [socket, messageListCallback]);

  const pinnedItem = () => {
    return (
      <View style={styles.pinnedItemOuter}>
        <TouchableOpacity style={styles.removePin}>
          <Text style={styles.closeText}>X</Text>
        </TouchableOpacity>
        <Image source={images.user} style={styles.profileImage} />
        <Text style={styles.pinnedUsername} numberOfLines={1}>
          User Name
        </Text>
      </View>
    );
  };

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

      <View style={styles.pinnedOuter}>
        <Text style={globalStyles.regularText14}>
          {t('pinnedConversations')}
        </Text>
        <FlatList
          data={[{}, {}]}
          showsHorizontalScrollIndicator={false}
          horizontal
          renderItem={pinnedItem}
          keyExtractor={(item: any) => item.id}
        />
      </View>

      <View style={styles.header}>
        <Text style={styles.discussHeadign}>{t('myDiscussions')}</Text>
        <TouchableOpacity onPress={() => setShowFilter(true)}>
          <Image source={images.filter} style={styles.filterImage} />
        </TouchableOpacity>
      </View>

      <View style={styles.chatlistContainer}>
        {messages.length > 0 ? (
          <SwipeListView
            data={messages}
            renderItem={({item}) => (
              <ChatComponent
                item={item}
                onLongPress={() => {
                  setShowChatActions(true);
                }}
              />
            )}
            keyExtractor={(item: any) => item?.id}
            renderHiddenItem={(data, rowMap) => {
              return (
                <View style={styles.leftHiddenItems}>
                  <View style={styles.rightFirstItem}>
                    <Image source={images.trash} style={styles.trashImage} />
                  </View>
                  <View style={styles.rightSecondItem}>
                    <Image
                      source={images.archive}
                      style={styles.archiveImage}
                    />
                  </View>
                  <View style={styles.rightThirdItem}>
                    <Image source={images.pin} style={styles.trashImage} />
                  </View>
                </View>
              );
            }}
            disableRightSwipe
            rightOpenValue={-180}
          />
        ) : (
          <View style={styles.chatemptyContainer}>
            <Text style={styles.chatemptyText}>{t('noMessages')}</Text>
            <Text>Add a user to start messaging</Text>
          </View>
        )}
      </View>
      {visible ? <Modal setVisible={setVisible} user={username} /> : ''}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.editButton}>
        <Image source={images.edit} style={styles.editImage} />
      </TouchableOpacity>
      <ChatFilter
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        isVisible={showFilter}
        hideFilter={() => setShowFilter(false)}
      />
      <ChatAction
        isVisible={showChatActions}
        hideActionMenu={() => setShowChatActions(false)}
      />
    </SafeAreaView>
  );
};

export default Chat;
