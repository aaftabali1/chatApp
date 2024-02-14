import React, {useState} from 'react';
import {
  Text,
  SafeAreaView,
  View,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import {styles} from '../../utils/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import constants from '../../utils/constants';

const Login = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [username, setUsername] = useState('');

  const storeUsername = async () => {
    try {
      let data = JSON.stringify({
        username: username,
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${constants.ip}/register`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: data,
      };

      axios
        .request(config)
        .then(async response => {
          console.log(JSON.stringify(response.data));
          await AsyncStorage.setItem('username', username);
          await AsyncStorage.setItem(
            'userId',
            response.data.user.user_id.toString(),
          );
          navigation.navigate('Chat');
        })
        .catch(error => {
          // navigation.navigate('Chat');
          console.log(error);
        });
    } catch (e) {
      Alert.alert('Error! While saving username');
    }
  };

  const handleSignIn = () => {
    if (username.trim()) {
      storeUsername();
    } else {
      Alert.alert('Username is required.');
    }
  };

  return (
    <SafeAreaView style={styles.loginscreen}>
      <View style={styles.loginscreen}>
        <Text style={styles.loginheading}>Sign in</Text>
        <View style={styles.logininputContainer}>
          <TextInput
            autoCorrect={false}
            placeholder="Enter your username"
            style={styles.logininput}
            onChangeText={value => setUsername(value)}
          />
        </View>

        <Pressable onPress={handleSignIn} style={styles.loginbutton}>
          <View>
            <Text style={styles.loginbuttonText}>Get Started</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Login;
