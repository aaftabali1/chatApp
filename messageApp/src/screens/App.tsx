import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from './Login';
import Chat from './Chat';
import Messaging from './Messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '../translations/i18n.config';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import BottomNavBar from '../components/BottomNavBar';
import CustomHeader from '../components/CustomHeader';
import Calls from './Calls';
import IncomingCall from './IncomingCall';
import socket from '../utils/socket';
import {navigationRef} from '../utils/navigationRef';
import constants from '../utils/constants';
import Settings from './Settings';
import Contacts from './Contacts';

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
            console.log('Data is here line 37 App jS', data);

            navigationRef.current?.navigate('IncomingCall', {
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
          name="IncomingCall"
          component={IncomingCall}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
