import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from './styles';
import images from '../../utils/images';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import constants from '../../utils/constants';
import {globalStyles} from '../../utils/commonStyles';

const Calls = () => {
  const {t} = useTranslation();

  const [user, setUser] = useState('');
  const [offset, setOffset] = useState(0);
  const [callList, setCallList] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

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
        <View style={styles.callItemContainer}>
          <Image source={images.user} style={styles.userImage} />
          <View style={{marginHorizontal: 10, flex: 1}}>
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
          <View>
            <Text style={globalStyles.lightText14}>
              Yesterday{'\n'}2 minutes
            </Text>
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

      {/* <View style={styles.searchInputContainer}>
        <Image source={images.search} style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder={t('search')} />
      </View> */}

      <View style={styles.topTabContainer}>
        <TouchableOpacity
          onPress={() => setSelectedTab(0)}
          style={[styles.tabs, selectedTab == 0 && styles.selectedTab]}>
          <Text style={styles.tabText}>{t('all')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab(1)}
          style={[styles.tabs, selectedTab == 1 && styles.selectedTab]}>
          <Text style={styles.tabText}>{t('missed')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.initiateCallContainer}>
        <View style={styles.newCallContainer}>
          <Image source={images.note} style={styles.newCallIcon} />
          <Text style={styles.newCallText}>{t('newCall')}</Text>
          <Image source={images.chevronRight} style={styles.nextArrow} />
        </View>
        <View style={styles.divider} />
        <View style={styles.newCallContainer}>
          <Image source={images.group} style={styles.newCallIcon} />
          <Text style={styles.newCallText}>{t('startGroupCall')}</Text>
          <Image source={images.chevronRight} style={styles.nextArrow} />
        </View>
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
