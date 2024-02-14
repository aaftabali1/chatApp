import React, {useCallback, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from './screens/Login';
import Chat from './screens/Chat';
import Messaging from './screens/Messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import './translations/i18n.config';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import BottomNavBar from './components/BottomNavBar';
import CustomHeader from './components/CustomHeader';
import Calls from './screens/Calls';
import IncomingVideoCall from './screens/IncomingVideoCall';
import IncomingVoiceCall from './screens/IncomingVoiceCall';
import socket from './utils/socket';
import {getCurrentRouteName, navigationRef} from './utils/navigationRef';
import constants from './utils/constants';
import Settings from './screens/Settings';
import Contacts from './screens/Contacts';
import {Provider} from 'react-redux';
import store from './redux/store';
import notifee, {AndroidImportance} from '@notifee/react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [initScreen, setInitScreen] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('username')
      .then(username => {
        if (username) {
          setInitScreen('Chat');
          socket.on('newCall', data => {
            navigationRef.current?.navigate('IncomingVideoCall', {
              callId: data.callId,
              username: data.callerId,
              currentUser: username,
              callType: constants.incomingCall,
              message: data.rtcMessage,
            });
          });
          socket.on('newAudioCall', data => {
            navigationRef.current?.navigate('IncomingVoiceCall', {
              callId: data.callId,
              username: data.callerId,
              currentUser: username,
              callType: constants.incomingCall,
              message: data.rtcMessage,
            });
          });
        } else {
          setInitScreen('Login');
        }
      })
      .catch(e => {
        setInitScreen('Login');
      });
  }, []);

  useEffect(() => {
    const setNotification = async () => {
      await notifee.requestPermission();
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        description: 'A default channel for app notifications',
        importance: AndroidImportance.HIGH,
      });
    };

    setNotification();
  }, []);

  const newMessageCallback = useCallback(
    async (data: any) => {
      if (getCurrentRouteName() == 'Messaging') {
        return;
      }
      await notifee.displayNotification({
        title: data.title,
        body: data.message,
        android: {
          channelId: 'default',
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'local.wav',
        },
      });
    },
    [socket, getCurrentRouteName],
  );

  useEffect(() => {
    socket.on('newMessage', newMessageCallback);
    return () => {
      socket.off('newMessage', newMessageCallback);
    };
  }, [socket, newMessageCallback]);

  if (initScreen === '') {
    return null;
  }

  const ChatScreens = () => {
    return (
      <Stack.Navigator initialRouteName={initScreen}>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="Chat"
          component={Chat}
          options={{
            title: 'Chats',
            headerShown: false,
          }}
        />
        <Stack.Screen name="Messaging" component={Messaging} />
      </Stack.Navigator>
    );
  };

  const HomeScreens = () => {
    return (
      <Tab.Navigator
        screenOptions={{headerShown: false}}
        tabBar={props => <BottomNavBar {...props} />}>
        <Tab.Screen name="messages" component={Chat} />
        <Tab.Screen name="calls" component={Calls} />
        <Tab.Screen name="settings" component={Settings} />
        <Tab.Screen name="contacts" component={Contacts} />
      </Tab.Navigator>
    );
  };

  return (
    <Provider store={store}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName={initScreen}>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="Chat"
            component={HomeScreens}
            options={{
              title: 'Chats',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Messaging"
            component={Messaging}
            options={{
              header: props => <CustomHeader {...props} title="messaging" />,
            }}
          />

          <Stack.Screen
            name="IncomingVideoCall"
            component={IncomingVideoCall}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="IncomingVoiceCall"
            component={IncomingVoiceCall}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
