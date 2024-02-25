import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {
  selectUserId,
  selectUsername,
  setUsername,
  setUserId,
} from '../../redux/slices/authSlice';
import {useFocusEffect} from '@react-navigation/native';
import {globalStyles} from '../../utils/commonStyles';
import ChatFilter from '../../components/ChatFilter';
import ChatAction from '../../components/ChatAction';
import SuccessModel from '../../components/Success';
import TwoBtnAlert from '../../components/TwoBtnAlert';
import {
  archiveChat,
  fetchChats,
  pinChat,
  unPinChat,
} from '../../redux/slices/chatsSlice';
import constants from '../../utils/constants';

const Chat = () => {
  const {t} = useTranslation();

  const dispatch = useDispatch<any>();
  const username = useSelector(selectUsername);
  const userId = useSelector(selectUserId);

  const chatsReducer = useSelector((state: any) => state.chats);
  const chats = useSelector((state: any) => state.chats.chats);
  const prevChatsReducer = useRef<any>(null);

  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filterValue, setFilterValue] = useState(0);
  const [showChatActions, setShowChatActions] = useState(false);
  const [showMessagePinnedModal, setShowMessagePinnedModal] = useState(false);
  const [showMessageUnPinnedModal, setShowMessageUnPinnedModal] =
    useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showArchiveSuccessModal, setShowArchiveSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [showDeleteMessageModal, setShowDeleteMessageModal] = useState(false);
  const [showDeleteMessageSuccessModal, setShowDeleteMessageSuccessModal] =
    useState(false);
  const [actionChatId, setActionChatId] = useState(0);

  useEffect(() => {
    getUsername();
  }, []);

  useEffect(() => {
    setMessages(chats);
  }, [chats]);

  useFocusEffect(
    useCallback(() => {
      getMessages();
      return () => {};
    }, [username, dispatch, userId]),
  );

  const getUsername = async () => {
    try {
      const value = await AsyncStorage.getItem('username');
      const valueUserId = await AsyncStorage.getItem('userId');
      if (value !== null) {
        dispatch(setUsername(value));
      }
      if (valueUserId !== null) {
        dispatch(setUserId(valueUserId));
      }
    } catch (e) {
      console.error('Error while loading username!');
    }
  };

  const updateUser = (value: string) => {
    socket.emit('updateUser', value);
  };

  const getMessages = () => {
    dispatch(fetchChats({username: userId}));
  };

  useEffect(() => {
    if (username == null) return;
    if (userId == null) return;
    getMessages();
    updateUser(username);
  }, [username, dispatch, userId]);

  const messageListCallback = useCallback(async () => {
    getMessages();
    // getUsername();
  }, [socket, getMessages]);

  useEffect(() => {
    socket.on('allMessageList', messageListCallback);
    return () => {
      socket.off('allMessageList', messageListCallback);
    };
  }, [socket, messageListCallback]);

  const handleUnPinChat = ({pinChatId}: {pinChatId: string}) => {
    dispatch(unPinChat({pinChatId, userId}));
  };

  const pinnedItem = ({item}: any) => {
    return (
      <View style={styles.pinnedItemOuter}>
        <TouchableOpacity
          onPress={() => handleUnPinChat({pinChatId: item.pinned_id})}
          style={styles.removePin}>
          <Text style={styles.closeText}>X</Text>
        </TouchableOpacity>
        <Image source={images.user} style={styles.profileImage} />
        <Text style={styles.pinnedUsername} numberOfLines={1}>
          {item.receiver_name}
        </Text>
      </View>
    );
  };

  const handlePinUnPinChat = () => {
    setShowChatActions(false);
    setTimeout(() => {
      setShowMessagePinnedModal(true);
      setTimeout(() => {
        setShowMessagePinnedModal(false);
      }, 2000);
    }, 500);
  };

  const handleSecrectChat = () => {
    setShowChatActions(false);
  };

  const handleMarkReadChat = () => {
    setShowChatActions(false);
  };

  const handleAccessContactDetails = () => {
    setShowChatActions(false);
  };

  const handleDeleteAllMessages = () => {
    setShowChatActions(false);
  };

  const handleDeleteConversation = () => {
    setShowChatActions(false);
  };

  const handlePinChat = ({chatId}: {chatId: string}) => {
    dispatch(pinChat({chatId, userId}));
  };

  useEffect(() => {
    if (prevChatsReducer.current !== null) {
      if (
        prevChatsReducer.current?.archiveChatLoading == true &&
        chatsReducer.archiveChatLoading == false
      ) {
        setShowArchiveSuccessModal(true);
        setShowArchiveModal(false);
        setTimeout(() => {
          setShowArchiveSuccessModal(false);
        }, 2000);
      }
    }
    prevChatsReducer.current = chatsReducer;
  }, [chatsReducer.archiveChatLoading]);

  const handleArchiveChat = () => {
    dispatch(archiveChat({chatId: actionChatId, userId}));
  };

  const allMessages = () => {
    let allMessage = messages.filter(
      (item: any) => item?.pinned != 1 && item?.archived != 1,
    );

    if (filterValue == 1) {
      allMessage = messages.filter(
        (item: any) => item?.archived == 1 && item?.pinned != 1,
      );
    }
    if (filterValue == 2) {
      allMessage = messages.filter(
        (item: any) => item?.archived != 1 && item?.unreadCount > 0,
      );
    }

    return allMessage;
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

      {messages?.length > 0 &&
        messages.filter(
          (item: any) => item?.pinned != null && item?.pinned != 0,
        )?.length > 0 && (
          <View style={styles.pinnedOuter}>
            <Text style={globalStyles.regularText14}>
              {t('pinnedConversations')}
            </Text>
            <FlatList
              data={messages.filter((item: any) => item?.pinned != null)}
              showsHorizontalScrollIndicator={false}
              horizontal
              renderItem={pinnedItem}
              keyExtractor={(item: any) => item.chat_id}
            />
          </View>
        )}

      <View style={styles.header}>
        <Text style={styles.discussHeadign}>{t('myDiscussions')}</Text>
        <TouchableOpacity onPress={() => setShowFilter(true)}>
          <Image source={images.filter} style={styles.filterImage} />
        </TouchableOpacity>
      </View>

      <View style={styles.chatlistContainer}>
        {messages.length > 0 ? (
          <SwipeListView
            data={allMessages()}
            renderItem={({item}) => {
              return (
                <ChatComponent
                  item={item}
                  onLongPress={() => {
                    setShowChatActions(true);
                  }}
                />
              );
            }}
            keyExtractor={(item: any) => item?.chat_id}
            renderHiddenItem={(data, rowMap) => {
              return (
                <View style={styles.leftHiddenItems}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowDeleteModal(true);
                    }}
                    style={styles.rightFirstItem}>
                    <Image source={images.trash} style={styles.trashImage} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setActionChatId(data.item.chat_id);
                      setShowArchiveModal(true);
                    }}
                    style={styles.rightSecondItem}>
                    <Image
                      source={images.archive}
                      style={styles.archiveImage}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      handlePinChat({chatId: data.item.chat_id});
                      // setShowMessagePinnedModal(true);
                      // setTimeout(() => {
                      //   setShowMessagePinnedModal(false);
                      // }, 2000);
                    }}
                    style={styles.rightThirdItem}>
                    <Image source={images.pin} style={styles.trashImage} />
                  </TouchableOpacity>
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

      {visible ? <Modal setVisible={setVisible} userId={userId} /> : ''}
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
        onPresspinUnpinChat={handlePinUnPinChat}
        hideActionMenu={() => setShowChatActions(false)}
        onPressSecretChat={handleSecrectChat}
        onPressMarkRead={handleMarkReadChat}
        onPressContactDetails={handleAccessContactDetails}
        onPressDeleteMessages={handleDeleteAllMessages}
        onPressDeleteConversation={handleDeleteConversation}
      />
      <SuccessModel
        visible={showMessagePinnedModal}
        descText={t('messageSuccessfullyPinned')}
      />
      <SuccessModel
        visible={showMessageUnPinnedModal}
        descText={t('messageUnpinned')}
      />
      <SuccessModel
        visible={showArchiveSuccessModal}
        descText={t('conversationSuccessfullyArchived')}
      />
      <SuccessModel
        visible={showDeleteSuccessModal}
        descText={t('conversationSuccessfullyArchived')}
      />
      <SuccessModel
        visible={showDeleteMessageSuccessModal}
        descText={t('conversationSuccessfullyArchived')}
      />
      {showArchiveModal && (
        <TwoBtnAlert
          descText={t('archiveChatModalTitle').replace(
            '{name}',
            messages.find((item: any) => item.chat_id == actionChatId)
              ?.receiver_name,
          )}
          okText={t('archiveConversation')}
          cancelText={t('cancel')}
          okAction={() => {
            handleArchiveChat();
          }}
          secondaryDesc={t('archiveChatModalDescription')}
          cancelAction={() => {
            setShowArchiveModal(false);
          }}
          cancelBtnStyle={{
            borderWidth: 0,
            shadowOpacity: 0,
            elevation: 0,
          }}
          cancelTextStyle={{textDecorationLine: 'underline'}}
        />
      )}
      {showDeleteModal && (
        <TwoBtnAlert
          descText={t('deleteChatModalTitle')}
          okText={t('deleteConversation')}
          cancelText={t('cancel')}
          okAction={() => {
            setShowDeleteSuccessModal(true);
            setShowDeleteModal(false);
            setTimeout(() => {
              setShowDeleteSuccessModal(false);
            }, 2000);
          }}
          secondaryDesc={t('deleteChatModalDescription')}
          cancelAction={() => {
            setShowDeleteModal(false);
          }}
          cancelBtnStyle={{
            borderWidth: 0,
            shadowOpacity: 0,
            elevation: 0,
          }}
          cancelTextStyle={{textDecorationLine: 'underline'}}
        />
      )}
      {showDeleteMessageModal && (
        <TwoBtnAlert
          descText={t('deleteMessageModalTitle')}
          okText={t('deleteMessages')}
          cancelText={t('cancel')}
          okAction={() => {
            setShowDeleteMessageSuccessModal(true);
            setShowDeleteMessageModal(false);
            setTimeout(() => {
              setShowDeleteMessageSuccessModal(false);
            }, 2000);
          }}
          secondaryDesc={t('deleteMessageModalDescription')}
          cancelAction={() => {
            setShowDeleteMessageModal(false);
          }}
          cancelBtnStyle={{
            borderWidth: 0,
            shadowOpacity: 0,
            elevation: 0,
          }}
          cancelTextStyle={{textDecorationLine: 'underline'}}
        />
      )}
    </SafeAreaView>
  );
};

export default Chat;
