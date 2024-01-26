import React, {useEffect, useState} from 'react';
import {
  Button,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from './styles';
import images from '../../utils/images';
import {useTranslation} from 'react-i18next';
import CustomHeader from '../../components/CustomHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import constants from '../../utils/constants';

const Calls = () => {
  const {t} = useTranslation();

  const [user, setUser] = useState('');
  const [offset, setOffset] = useState(0);
  const [callList, setCallList] = useState([]);

  useEffect(() => {
    getUsername();
  }, []);

  const getUsername = async () => {
    try {
      const value = await AsyncStorage.getItem('username');
      if (value !== null) {
        setUser(value);
        fetchCalls(value);
      }
    } catch (e) {
      console.error('Error while loading username!');
    }
  };

  const fetchCalls = async (value: string) => {
    const params = {
      username: value,
      offset: offset,
    };

    axios
      .get(`${constants.ip}/api/calls`, {params})
      .then(response => {
        setCallList(response?.data);
      })
      .catch(error => {
        console.error(
          'Error:',
          error.response ? error.response.data : error.message,
        );
      });
  };

  const callsItem = ({item}: any) => {
    console.log('====================================');
    console.log(item);
    console.log('====================================');
    return (
      <View style={{paddingHorizontal: 20}}>
        <View style={styles.callItemContainer}>
          <Image source={images.user} style={styles.userImage} />
          <View style={{marginHorizontal: 10}}>
            <Text style={styles.username}>
              {item.callerId == user ? item.receiverId : item.callerId}
            </Text>
            <View style={{flexDirection: 'row'}}>
              {item.type == 'auto' ? (
                item.callerId == user ? (
                  <>
                    <Image
                      source={images.outgoingCall}
                      style={styles.callIcons}
                    />
                    <Text style={styles.callStatus}>Outgoing Call</Text>
                  </>
                ) : (
                  <>
                    <Image
                      source={images.incomingCall}
                      style={styles.callIcons}
                    />
                    <Text style={styles.callStatus}>Incoming Call</Text>
                  </>
                )
              ) : item.status == 0 ? (
                <>
                  <Image
                    source={images.missedVideoCall}
                    style={styles.callIcons}
                  />
                  <Text style={styles.callStatusMissed}>Missed Video Call</Text>
                </>
              ) : (
                <>
                  <Image source={images.videoCall} style={styles.callIcons} />
                  <Text style={styles.callStatus}>Video Call</Text>
                </>
              )}
            </View>
          </View>
        </View>
        <View style={styles.bottomBorder} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.chatscreen}>
      <View style={styles.chattopContainer}>
        <View style={styles.chatheader}>
          <Text style={styles.chatheading}>{t('calls')}</Text>
        </View>
      </View>

      <View style={styles.searchInputContainer}>
        <Image source={images.search} style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder={t('search')} />
      </View>

      <View style={{flex: 1, marginTop: 20, marginBottom: 10}}>
        <FlatList
          data={callList}
          renderItem={callsItem}
          keyExtractor={(item: any) => item.id}
        />
      </View>
    </SafeAreaView>
  );
};

export default Calls;
