import React from 'react';

//👇🏻 app screens

//👇🏻 React Navigation configurations
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from './Login';
import Chat from './Chat';
import Messaging from './Messaging';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
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
