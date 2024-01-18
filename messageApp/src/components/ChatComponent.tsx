import {View, Text, Pressable, Image} from 'react-native';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {styles} from '../utils/styles';
import {getUsername} from '../utils/commonnFunctions';

const ChatComponent = ({item}: any) => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<any>({});
  const [user, setUser] = useState('');

  //👇🏻 Retrieves the last message in the array from the item prop
  useLayoutEffect(() => {
    setMessages(item.messages[item.messages.length - 1]);

    const setUsername = async () => {
      if (item.senderId == (await getUsername())) {
        setUser(item.receiverId);
      } else {
        setUser(item.senderId);
      }
    };
    setUsername();
  }, []);

  useEffect(() => {
    setMessages(item.messages[item.messages.length - 1]);
  }, [item]);

  ///👇🏻 Navigates to the Messaging screen
  const handleNavigation = () => {
    navigation.navigate('Messaging', {
      item: item,
      user: user,
    });
  };

  return (
    <Pressable style={styles.cchat} onPress={handleNavigation}>
      {/* <Ionicons
        name="person-circle-outline"
        size={45}
        color="black"
        style={styles.cavatar}
      /> */}

      <Image
        source={require('../assets/images/user.png')}
        style={styles.cavatar}
      />

      <View style={styles.crightContainer}>
        <View>
          <Text
            style={[
              styles.cusername,
              // !item?.read &&
              messages?.message && {color: '#0000CD'},
            ]}>
            {user}
          </Text>
          <Text
            style={[
              styles.cmessage,
              // !messages?.read &&
              messages?.message && {color: '#0000CD'},
            ]}>
            {messages?.message ? messages.message : 'Tap to start chatting'}
          </Text>
        </View>
        <View>
          <Text
            style={[
              styles.ctime,
              item?.read && messages?.message && {color: '#0000CD'},
            ]}>
            {messages?.time
              ? new Date(messages.time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'now'}
          </Text>
          {item?.read && messages?.message && (
            <View
              style={{
                backgroundColor: 'red',
                alignSelf: 'center',
                paddingHorizontal: 5,
                borderRadius: 20,
                marginTop: 5,
              }}>
              <Text style={{color: 'white'}}>1</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default ChatComponent;
