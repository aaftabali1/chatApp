import React from 'react';
import {
  Button,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from './styles';
import images from '../../utils/images';
import {useTranslation} from 'react-i18next';

const Contacts = () => {
  const {t} = useTranslation();

  return (
    <SafeAreaView style={styles.chatscreen}>
      <View style={styles.chattopContainer}>
        <View style={styles.chatheader}>
          <Text style={styles.chatheading}>{t('contacts')}</Text>
        </View>
      </View>

      <View style={styles.searchInputContainer}>
        <Image source={images.search} style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder={t('search')} />
      </View>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text style={{}}>{t('noContactsToShow')}</Text>
      </View>
    </SafeAreaView>
  );
};

export default Contacts;
