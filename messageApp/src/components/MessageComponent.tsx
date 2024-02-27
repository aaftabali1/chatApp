import React, {useState} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {styles} from '../utils/commonStyles';
import constants from '../utils/constants';
import WaveForm from 'react-native-audiowaveform';
import images from '../utils/images';
import colors from '../utils/colors';

export default function MessageComponent({item, user}: any) {
  const status = item.sender_id != user;

  const [isPlaying, setIsPlaying] = useState(false);

  console.log('====================================');
  console.log(item);
  console.log('====================================');

  return (
    <View>
      <View
        style={
          status
            ? styles.mmessageWrapper
            : [styles.mmessageWrapper, {alignItems: 'flex-end'}]
        }>
        {item.attachment_id == null ? (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={require('../assets/images/user.png')}
              style={styles.mavatar}
            />
            <View
              style={
                status
                  ? styles.mmessage
                  : [styles.mmessage, {backgroundColor: colors.messageBg}]
              }>
              <Text>{item.content}</Text>
            </View>
          </View>
        ) : (
          <View>
            {item.attachment_type == 0 && (
              <View
                style={{
                  borderRadius: 10,
                  overflow: 'hidden',
                  marginBottom: 5,
                }}>
                <Image
                  source={{
                    uri: `${constants.ip}/uploads/${item.attachment_url}`,
                  }}
                  style={{width: 250, height: 200}}
                />
              </View>
            )}
            {item.attachment_type == 2 && (
              <View
                style={[
                  styles.waveformContainer,
                  !status && {backgroundColor: colors.messageBg},
                ]}>
                <TouchableOpacity onPress={() => setIsPlaying(prev => !prev)}>
                  <Image
                    source={isPlaying ? images.pause : images.play}
                    style={styles.playIcon}
                  />
                </TouchableOpacity>
                <WaveForm
                  play={isPlaying}
                  autoPlay={false}
                  style={[styles.waveform]}
                  waveFormStyle={{
                    waveColor: colors.blueLight,
                    scrubColor: colors.primaryBlue,
                  }}
                  source={{
                    uri: `${constants.ip}/audios/${item.attachment_url}`,
                  }}
                />
              </View>
            )}
          </View>
        )}
        <Text style={{marginLeft: 40}}>
          {new Date(item.date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}
