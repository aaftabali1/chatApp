import React, {useEffect, useState} from 'react';

//👇🏻 app screens

//👇🏻 React Navigation configurations
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from './Login';
import Chat from './Chat';
import Messaging from './Messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initScreen, setInitScreen] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('username')
      .then(username => {
        if (username) {
          setInitScreen('Chat');
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

  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
}
