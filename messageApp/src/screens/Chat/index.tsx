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
import SuccessModel from '../../components/Success';
import TwoBtnAlert from '../../components/TwoBtnAlert';

const Chat = () => {
  const {t} = useTranslation();

  const dispatch = useDispatch();
  const username = useSelector(selectUsername);

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
          data={[{id: 'asdf'}, {id: 'asdfef'}]}
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
                  <TouchableOpacity
                    onPress={() => {
                      setShowDeleteModal(true);
                    }}
                    style={styles.rightFirstItem}>
                    <Image source={images.trash} style={styles.trashImage} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
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
                      setShowMessagePinnedModal(true);
                      setTimeout(() => {
                        setShowMessagePinnedModal(false);
                      }, 2000);
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
          descText={t('archiveChatModalTitle')}
          okText={t('archiveConversation')}
          cancelText={t('cancel')}
          okAction={() => {
            setShowArchiveSuccessModal(true);
            setShowArchiveModal(false);
            setTimeout(() => {
              setShowArchiveSuccessModal(false);
            }, 2000);
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
