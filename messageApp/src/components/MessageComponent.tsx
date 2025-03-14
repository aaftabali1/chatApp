import React, {useEffect, useState} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {styles} from '../utils/commonStyles';
import constants from '../utils/constants';
import WaveForm from 'react-native-audiowaveform';
import images from '../utils/images';
import colors from '../utils/colors';
import ScaledImage from './ScaledImage';
import {createThumbnail} from 'react-native-create-thumbnail';

export default function MessageComponent({
  item,
  user,
  toggleImageVideoSlider,
}: any) {
  const status = item.sender_id != user;

  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnail, setThumbnail] = useState({
    path: '',
    width: 200,
    height: 200,
  });

  useEffect(() => {
    if (item.attachment_type != 1) return;
    createThumbnail({
      url: `${constants.ip}/uploads/${item.attachment_url}`,
      timeStamp: 1,
    })
      .then(response => {
        console.log({response});
        setThumbnail(response);
      })
      .catch(err => console.log({err}));
  }, []);

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
              <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                {status && (
                  <Image
                    source={require('../assets/images/user.png')}
                    style={styles.mavatar}
                  />
                )}
                <View
                  style={{
                    borderRadius: 10,
                    overflow: 'hidden',
                    marginBottom: 5,
                  }}>
                  <ScaledImage
                    uri={`${constants.ip}/uploads/${item.attachment_url}`}
                    width={200}
                    height={200}
                  />
                </View>
              </View>
            )}
            {item.attachment_type == 1 && (
              <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                <TouchableOpacity
                  onPress={toggleImageVideoSlider}
                  style={{
                    borderRadius: 10,
                    overflow: 'hidden',
                    marginBottom: 5,
                  }}>
                  <Image
                    source={{
                      uri: thumbnail.path,
                    }}
                    style={{
                      width: 250,
                      height: 250,
                    }}
                    resizeMode="cover"
                  />
                  <View style={styles.playOuter}>
                    <Image source={images.play} style={styles.playImage} />
                  </View>
                </TouchableOpacity>
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
