import React, {useEffect, useLayoutEffect, useState} from 'react';
import {View, Text, Pressable, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {styles} from '../utils/commonStyles';
import {useSelector} from 'react-redux';
import {selectUserId, selectUsername} from '../redux/slices/authSlice';
import colors from '../utils/colors';

const ChatComponent = ({item, onLongPress}: any) => {
  const username = useSelector(selectUsername);
  const userId = useSelector(selectUserId);

  const navigation = useNavigation<any>();
  const [messages, setMessages] = useState<any>({});
  const [user, setUser] = useState('');

  useLayoutEffect(() => {
    setMessages(item?.messages?.length > 0 ? item.messages[0] : '');

    const setUsername = async () => {
      setUser(item.receiver_name);
    };
    setUsername();
  }, []);

  useEffect(() => {
    setMessages(item?.messages?.length > 0 ? item.messages[0] : '');
  }, [item]);

  const handleNavigation = () => {
    navigation.navigate('Messaging', {
      item: item,
      receiver: user,
    });
  };

  return (
    <Pressable
      style={styles.cchat}
      onLongPress={onLongPress}
      onPress={handleNavigation}>
      <Image
        source={require('../assets/images/user.png')}
        style={styles.cavatar}
      />

      <View style={styles.crightContainer}>
        <View>
          <Text
            style={[
              styles.cusername,
              item?.unreadCount > 0 && {color: colors.primaryBlue},
            ]}>
            {user}
          </Text>
          <Text
            style={[
              styles.cmessage,
              item?.unreadCount > 0 && {color: colors.primaryBlue},
            ]}>
            {messages?.content ? messages.content : 'Tap to start chatting'}
          </Text>
        </View>
        <View>
          <Text style={[styles.ctime]}>
            {messages?.date
              ? new Date(messages.date).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'now'}
          </Text>
          {item?.unreadCount > 0 && (
            <View
              style={{
                backgroundColor: colors.orange,
                alignSelf: 'center',
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: 20,
                marginTop: 5,
              }}>
              <Text style={{color: colors.textColor}}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default ChatComponent;
