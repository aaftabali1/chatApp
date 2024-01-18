import React, {useState} from 'react';
import {
  Button,
  Image,
  SafeAreaView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from './styles';
import images from '../../utils/images';
import {useTranslation} from 'react-i18next';

const Settings = () => {
  const {t, i18n} = useTranslation();

  return (
    <SafeAreaView style={styles.chatscreen}>
      <View style={styles.chattopContainer}>
        <View style={styles.chatheader}>
          <Text style={styles.chatheading}>{t('settings')}</Text>
        </View>
      </View>
      <View style={{flex: 1, paddingTop: 20, padding: 20}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>
              {t('language')}
            </Text>{' '}
            ({i18n.language == 'en' ? 'English' : 'French'})
          </Text>
          <Switch
            value={i18n.language == 'en' ? true : false}
            onChange={() => {
              if (i18n.language == 'en') {
                i18n.changeLanguage('fr');
              } else {
                i18n.changeLanguage('en');
              }
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
