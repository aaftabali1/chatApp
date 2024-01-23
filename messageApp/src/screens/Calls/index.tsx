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
    return (
      <View style={{paddingHorizontal: 20}}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            paddingVertical: 10,
            alignItems: 'center',
          }}>
          <Image source={images.user} style={{width: 40, height: 40}} />
          <View style={{marginHorizontal: 10}}>
            <Text>
              {item.callerId == user ? item.receiverId : item.callerId}
            </Text>
            <Text>
              {item.callerId == user ? 'Outgoing Call' : 'Incoming Call'}
            </Text>
          </View>
        </View>
        <View style={{borderWidth: StyleSheet.hairlineWidth}} />
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

      <View style={styles.header}>
        <Text style={styles.discussHeadign}>{t('myDiscussions')}</Text>
        <TouchableOpacity>
          <Image source={images.filter} style={styles.filterImage} />
        </TouchableOpacity>
      </View>

      <View style={{flex: 1}}>
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
